from sqlalchemy.orm import Session, joinedload
from app.models.bed import Bed
from app.models.room import Room
from app.models.pg import PG
from app.models.user import User
from fastapi import HTTPException

def get_available_beds_grouped(db: Session, current_user: User = None):
    """
    Get all available beds grouped by PG -> Room for the current admin
    """
    if not current_user:
        return []
    
    # Get all available beds from PGs administered by current user
    beds = db.query(Bed).join(
        Room, Bed.room_id == Room.id
    ).join(
        PG, Room.pg_id == PG.id
    ).filter(
        PG.admin_id == current_user.id,
        Bed.is_occupied == False
    ).options(
        joinedload(Bed.room).joinedload(Room.pg)
    ).all()
    
    # Group by PG and Room
    result = []
    for bed in beds:
        result.append({
            "bed_id": bed.id,
            "rent": bed.rent,
            "room_id": bed.room.id,
            "room_number": bed.room.room_number,
            "pg_id": bed.room.pg.id,
            "pg_name": bed.room.pg.name,
            "pg_address": bed.room.pg.address
        })
    
    return result

def create_bed(db: Session, rent, room_id: int):
    bed = Bed(rent=rent, room_id=room_id)
    db.add(bed)
    db.commit()
    db.refresh(bed)
    return bed

def get_beds(db: Session, room_id: int):
    beds = db.query(Bed).filter(Bed.room_id == room_id).options(
        joinedload(Bed.room)
    ).all()
    
    return [
        {
            "id": bed.id,
            "room_number": bed.room.room_number,
            "rent": bed.rent,
            "is_occupied": bed.is_occupied
        }
        for bed in beds
    ]

def delete_bed(db: Session, bed_id: int):
    bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    
    if bed.is_occupied:
        raise HTTPException(status_code=400, detail="Cannot delete an occupied bed")
    
    db.delete(bed)
    db.commit()
    return {"message": "Bed deleted successfully"}
