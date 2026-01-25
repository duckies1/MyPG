from pydantic import BaseModel

class PGCreate(BaseModel):
    name: str
    address: str

class PGOut(BaseModel):
    id: int
    name: str
    address: str
    admin_id: int

    class Config:
        orm_mode = True
