from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.pg import PG
from app.models.user import User, UserRole

def create_pg(db: Session, pg_data, current_user: User):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can create PGs")

    pg = PG(
        name=pg_data.name,
        address=pg_data.address,
        admin_id=current_user.id
    )

    db.add(pg)
    db.commit()
    db.refresh(pg)
    return pg

def get_pgs(db: Session, current_user: User = None):
    if current_user and current_user.role == UserRole.ADMIN:
        return db.query(PG).filter(PG.admin_id == current_user.id).all()
    return []