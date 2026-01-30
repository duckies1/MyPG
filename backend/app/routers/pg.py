from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.pg import PGCreate, PGOut
from app.services.pg_service import create_pg, get_pgs
from app.core.auth import get_current_user  

router = APIRouter(prefix="/pg", tags=["PG"])

@router.post("/create", response_model=PGOut)
def add_pg(
    pg: PGCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return create_pg(db, pg, current_user)

# @router.get("/get", response_model=list[PGOut])
# def list_pgs(db: Session = Depends(get_db)):
#     return get_pgs(db)

@router.get("/get", response_model=list[PGOut])
def list_my_pgs(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return get_pgs(db, current_user)

