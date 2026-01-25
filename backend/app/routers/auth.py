from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin
from app.models.user import User
from app.core.database import get_db

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

### Authentication Router :- All the auth related routes/endpoints will be defined here

router = APIRouter(prefix="/auth", tags=["Auth"])

### User Signup Endpoint :- Creates a new user and returns an access token, if email is not already registered

@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id)})

    return {"access_token": token}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # 1. Find user by email
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # 2. Verify password
    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # 3. Create JWT token
    token = create_access_token(
        {"sub": str(db_user.id)}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

