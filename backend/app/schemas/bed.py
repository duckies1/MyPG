from pydantic import BaseModel

class BedCreate(BaseModel):
    room_id: int
    rent: float

class BedOut(BaseModel):
    id: int
    room_id: int
    rent: float
    is_occupied: bool

    class Config:
        orm_mode = True
