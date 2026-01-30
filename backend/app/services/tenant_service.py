from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.tenant import TenantProfile
from app.models.bed import Bed
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
    if current_user:
        return db.query(TenantProfile).filter(TenantProfile.user_id == current_user.id).all()
    return []
