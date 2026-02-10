from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin, UserResponse, InviteGenerateRequest
from app.core.database import get_db
from app.services.auth_service import signup_service, login_service, generate_invite_code, get_user_status
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    token, error = signup_service(db, user.name, user.email, user.password, user.invite_code)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {"access_token": token}


@router.post("/login")
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    token, error = login_service(db, user.email, user.password)

    if error:
        raise HTTPException(status_code=401, detail=error)

    # ✅ Set JWT in cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=3600,   # 1 hour
        samesite="lax"
    )

    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", samesite="lax")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/status")
def get_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_user_status(db, current_user)

@router.post("/invite/generate")
def generate_invite(
    request: InviteGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result, error = generate_invite_code(db, request.pg_id, current_user)
    if error:
        raise HTTPException(status_code=403, detail=error)
    return result
