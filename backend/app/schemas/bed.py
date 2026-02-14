from pydantic import BaseModel

class BedCreate(BaseModel):
    room_id: int
    rent: float
    
class BedResponse(BaseModel):
    id: int
    room_number: int
    rent: float
    is_occupied: bool

    class Config:
        orm_mode = True
