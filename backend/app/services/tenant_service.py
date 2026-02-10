from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.tenant import TenantProfile
from app.models.bed import Bed
from app.models.room import Room
from app.models.pg import PG
from app.models.user import User, UserRole

def get_unassigned_tenants(db: Session, current_user: User = None):
    """
    Get all users with role=TENANT who don't have a TenantProfile yet
    Filtered by users who were invited to the current admin's PGs
    """
    if not current_user:
        return []
    
    # Get PG IDs owned by current admin
    admin_pg_ids = [pg.id for pg in current_user.pgs]
    
    # Get users who are tenants, don't have a tenant_profile, and were invited to admin's PGs
    unassigned = db.query(User).outerjoin(
        TenantProfile, User.id == TenantProfile.user_id
    ).filter(
        User.role == UserRole.TENANT,
        TenantProfile.id == None,
        User.invited_pg_id.in_(admin_pg_ids)
    ).all()
    
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value
        }
        for user in unassigned
    ]

def create_tenant(
    db: Session,
    user_id: int,
    bed_id: int,
    move_in_date,
    current_user: User = None
):
    # Verify the bed exists
    bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")

    # Get the room and PG for ownership verification
    room = db.query(Room).filter(Room.id == bed.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    pg = db.query(PG).filter(PG.id == room.pg_id).first()
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    
    # Authorization check: Admin must own the PG
    if current_user and pg.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to assign tenants to this PG")
    
    # Verify the user exists and is a tenant
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role != UserRole.TENANT:
        raise HTTPException(status_code=400, detail="User must have TENANT role")

    # Check if bed is already occupied
    if bed.is_occupied:
        raise HTTPException(status_code=400, detail="Bed already occupied")

    tenant = TenantProfile(
        user_id=user_id,
        bed_id=bed_id,
        move_in_date=move_in_date
    )

    bed.is_occupied = True

    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    return tenant


def get_tenants(db: Session, current_user: User = None):
    if not current_user:
        return []
    
    # If user is admin, show all tenants from their PGs
    if current_user.role == UserRole.ADMIN:
        tenants = db.query(TenantProfile).join(
            Bed, TenantProfile.bed_id == Bed.id
        ).join(
            Room, Bed.room_id == Room.id
        ).join(
            PG, Room.pg_id == PG.id
        ).filter(
            PG.admin_id == current_user.id
        ).options(
            joinedload(TenantProfile.user),
            joinedload(TenantProfile.bed).joinedload(Bed.room).joinedload(Room.pg)
        ).all()
    
    # If user is tenant with bed, show only tenants from same PG
    elif current_user.role == UserRole.TENANT:
        # First check if this tenant has a bed assigned
        current_tenant = db.query(TenantProfile).filter(
            TenantProfile.user_id == current_user.id
        ).options(
            joinedload(TenantProfile.bed).joinedload(Bed.room)
        ).first()
        
        if not current_tenant:
            # Tenant has no bed assigned, return empty list
            return []
        
        # Get the PG ID for this tenant's bed
        tenant_pg_id = current_tenant.bed.room.pg_id
        
        # Get all tenants from the same PG
        tenants = db.query(TenantProfile).join(
            Bed, TenantProfile.bed_id == Bed.id
        ).join(
            Room, Bed.room_id == Room.id
        ).filter(
            Room.pg_id == tenant_pg_id
        ).options(
            joinedload(TenantProfile.user),
            joinedload(TenantProfile.bed).joinedload(Bed.room).joinedload(Room.pg)
        ).all()
    else:
        return []
    
    # Transform ORM objects to TenantOut schema format
    return [
        {
            "id": t.id,
            "user_id": t.user_id,
            "bed_id": t.bed_id,
            "move_in_date": t.move_in_date,
            "user_name": t.user.name,
            "user_email": t.user.email,
            "room_number": t.bed.room.room_number,
            "pg_name": t.bed.room.pg.name
        }
        for t in tenants
    ]
