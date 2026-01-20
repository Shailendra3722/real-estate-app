from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ...db.base import get_db
from ...db.models import User

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    token: str  # In production, this is the Google ID Token

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    is_verified: bool

@router.post("/google", response_model=AuthResponse)
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Exchanges Google ID Token for App Session.
    Current Mock Implementation:
    - If token is 'test_user', logs in as Test User.
    - Creates user if not exists.
    """
    # TODO: Validate Google Token
    
    # Mock Logic
    dummy_email = "test@example.com"
    user = db.query(User).filter(User.email == dummy_email).first()
    
    if not user:
        user = User(email=dummy_email, full_name="Test User", is_verified=False)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return {
        "access_token": "mock_jwt_token_" + user.id,
        "token_type": "bearer",
        "user_id": user.id,
        "is_verified": user.is_verified
    }

@router.get("/me")
def read_users_me(db: Session = Depends(get_db)):
    # Mock: Return fixed user
    dummy_email = "test@example.com"
    user = db.query(User).filter(User.email == dummy_email).first()
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email, "is_verified": user.is_verified}
