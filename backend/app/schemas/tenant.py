from pydantic import BaseModel
from datetime import date

class TenantCreate(BaseModel):
    user_id: int
    bed_id: int
    move_in_date: date

class TenantOut(BaseModel):
    id: int
    user_id: int
    bed_id: int
    move_in_date: date
    user_name: str
    user_email: str
    room_number: int
    pg_name: str

    class Config:
        from_attributes = True
