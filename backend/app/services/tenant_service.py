from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.tenant import TenantProfile
from app.models.bed import Bed
from app.models.room import Room
from app.models.pg import PG
from app.models.user import User

def create_tenant(
    db: Session,
    user_id: int,
    bed_id: int,
    move_in_date
):
    bed = db.query(Bed).filter(Bed.id == bed_id).first()

    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")

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
    
    # Get all tenants from PGs administered by the current user
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
