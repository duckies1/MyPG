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

    class Config:
        orm_mode = True
