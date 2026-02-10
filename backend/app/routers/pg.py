from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.pg import PGCreate, PGOut
from app.services.pg_service import create_pg, get_pgs
from app.core.auth import get_current_user
from app.models.user import User, UserRole

router = APIRouter(prefix="/pg", tags=["PG"])

@router.post("/create", response_model=PGOut)
def add_pg(
    pg: PGCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Block tenants from creating PGs
    if current_user.role == UserRole.TENANT:
        raise HTTPException(status_code=403, detail="Tenants cannot create PGs")
    return create_pg(db, pg, current_user)

# @router.get("/get", response_model=list[PGOut])
# def list_pgs(db: Session = Depends(get_db)):
#     return get_pgs(db)

@router.get("/get", response_model=list[PGOut])
def list_my_pgs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Block tenants from accessing PG list
    if current_user.role == UserRole.TENANT:
        raise HTTPException(status_code=403, detail="Tenants cannot access PG management")
    return get_pgs(db, current_user)

