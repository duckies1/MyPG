from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.tenant import TenantCreate, TenantOut
from app.services.tenant_service import create_tenant, get_tenants

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.post("/create", response_model=TenantOut)
def add_tenant(
    tenant: TenantCreate,
    db: Session = Depends(get_db)
):
    return create_tenant(
        db,
        tenant.user_id,
        tenant.bed_id,
        tenant.move_in_date
    )

@router.get("/", response_model=list[TenantOut])
def list_tenants(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_tenants(db, current_user)
