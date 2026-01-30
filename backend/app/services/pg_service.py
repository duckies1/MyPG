from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.pg import PG
from app.models.user import User, UserRole
from app.models.room import Room
from app.models.bed import Bed

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

def get_pg_stats(db: Session, pg_id: int):
    """Calculate room and occupancy stats for a PG"""
    total_rooms = db.query(func.count(Room.id)).filter(Room.pg_id == pg_id).scalar() or 0
    total_beds = db.query(func.count(Bed.id)).join(Room).filter(Room.pg_id == pg_id).scalar() or 0
    occupied_beds = db.query(func.count(Bed.id)).join(Room).filter(Room.pg_id == pg_id, Bed.is_occupied == True).scalar() or 0
    total_tenants = occupied_beds
    
    return {
        "total_rooms": total_rooms,
        "total_beds": total_beds,
        "occupied_beds": occupied_beds,
        "total_tenants": total_tenants
    }

def get_pgs(db: Session, current_user: User = None):
    if current_user and current_user.role == UserRole.ADMIN:
        pgs = db.query(PG).filter(PG.admin_id == current_user.id).all()
        # Enrich PGs with stats
        for pg in pgs:
            stats = get_pg_stats(db, pg.id)
            pg.total_rooms = stats["total_rooms"]
            pg.total_beds = stats["total_beds"]
            pg.occupied_beds = stats["occupied_beds"]
            pg.total_tenants = stats["total_tenants"]
        return pgs
    return []