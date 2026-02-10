from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.pg import PG
from app.models.tenant import TenantProfile
from app.core.security import hash_password, verify_password, create_access_token
import secrets

def signup_service(db: Session, name: str, email: str, password: str, invite_code: str = None):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return None, "Email already registered"

    invited_pg_id = None
    invite_admin = None
    
    # If invite code provided, validate and get PG
    if invite_code:
        admin = db.query(User).filter(User.invite_code == invite_code).first()
        if not admin:
            return None, "Invalid invite code"

        invited_pg_id = admin.invited_pg_id
        if not invited_pg_id:
            return None, "Invite code is not linked to a PG"

        invite_admin = admin

    new_user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        invited_pg_id=invited_pg_id
    )

    db.add(new_user)

    # Single-use invite: invalidate code after first successful signup
    if invite_admin:
        invite_admin.invite_code = None
        invite_admin.invited_pg_id = None

    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id)})

    return token, None

def generate_invite_code(db: Session, pg_id: int, admin_user: User):
    # Verify admin owns this PG
    pg = db.query(PG).filter(PG.id == pg_id, PG.admin_id == admin_user.id).first()
    if not pg:
        return None, "PG not found or not authorized"
    
    # Generate unique code
    invite_code = secrets.token_urlsafe(12)
    
    # Update admin's invite code
    admin_user.invite_code = invite_code
    admin_user.invited_pg_id = pg_id
    db.commit()
    db.refresh(admin_user)
    
    return {"invite_code": invite_code, "pg_name": pg.name}, None


def login_service(db: Session, email: str, password: str):
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        return None, "Invalid email or password"

    if not verify_password(password, db_user.password_hash):
        return None, "Invalid email or password"

    token = create_access_token({"sub": str(db_user.id)})

    return token, None


def get_user_status(db: Session, user: User):
    """
    Check user status:
    - Admin: has access to everything
    - Tenant with bed: can view tenant list from same PG
    - Tenant without bed: waiting for bed assignment
    """
    if user.role == UserRole.ADMIN:
        return {
            "role": user.role.value,
            "has_access": True,
            "status": "active",
            "message": None
        }
    
    # Check if tenant has bed assigned
    tenant_profile = db.query(TenantProfile).filter(
        TenantProfile.user_id == user.id
    ).first()
    
    if tenant_profile:
        return {
            "role": user.role.value,
            "has_access": True,
            "has_bed": True,
            "status": "active",
            "message": None
        }
    else:
        return {
            "role": user.role.value,
            "has_access": False,
            "has_bed": False,
            "status": "pending",
            "message": "Please wait for website access. An admin needs to assign you a bed, or the super admin needs to promote you to admin."
        }

