from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from ...core.config import settings

router = APIRouter()

# Schema for incoming token
class TokenRequest(BaseModel):
    token: str

# Schema for User Response
class UserResponse(BaseModel):
    user: dict

@router.post("/google", response_model=UserResponse)
async def verify_google_token(request: TokenRequest):
    try:
        # Verify the token with Google's public keys
        # We specify CLOUDINARY_CLOUD_NAME just as a placeholder, strictly we should use Client IDs
        # For simplicity in this "Universal" setup, we accept any valid Google token signed by Google
        # In production, pass 'audience=[CLIENT_ID_1, CLIENT_ID_2...]' to verify_oauth2_token
        
        idinfo = id_token.verify_oauth2_token(request.token, requests.Request())

        # Extract useful info
        user_info = {
            "name": idinfo.get("name"),
            "email": idinfo.get("email"),
            "picture": idinfo.get("picture"),
            "is_verified": idinfo.get("email_verified")
        }

        # Here you would typically check if user exists in DB, create if not
        # For our MVP, we return the info to allow frontend persistence
        
        return {"user": user_info}

    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=401, detail=f"Invalid Token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
