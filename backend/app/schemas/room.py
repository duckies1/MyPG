from pydantic import BaseModel

class RoomCreate(BaseModel):
    pg_id: int
    room_number: str

class RoomOut(BaseModel):
    id: int
    pg_id: int
    room_number: str

    class Config:
        orm_mode = True
