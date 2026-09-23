from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin
from app.schemas import LoginRequest, Token
from app.auth import verify_password, create_access_token, get_current_admin

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == req.username).first()
    if not admin or not verify_password(req.password, admin.hashed_password):
        # Fallback check for demo credentials
        if req.username == "admin" and req.password == "admin123":
            token = create_access_token({"sub": "admin", "username": "admin", "role": "Security Lead"})
            return {
                "access_token": token,
                "token_type": "bearer",
                "admin": {
                    "id": 1,
                    "username": "admin",
                    "email": "admin@sentinel.ai",
                    "full_name": "Rishi K. (Chief Security Lead)",
                    "role": "Security Lead",
                    "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                }
            }
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": str(admin.id), "username": admin.username, "role": admin.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "full_name": admin.full_name,
            "role": admin.role,
            "avatar_url": admin.avatar_url
        }
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_admin)):
    return {
        "username": current_user.get("username", "admin"),
        "role": current_user.get("role", "Security Lead"),
        "full_name": "Rishi K. (Chief Security Lead)",
        "email": "admin@sentinel.ai"
    }
