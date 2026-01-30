from pydantic import BaseModel

class PGCreate(BaseModel):
    name: str
    address: str

class PGOut(BaseModel):
    id: int
    name: str
    address: str
    admin_id: int
    total_rooms: int = 0
    total_beds: int = 0
    occupied_beds: int = 0
    total_tenants: int = 0

    class Config:
        from_attributes = True
