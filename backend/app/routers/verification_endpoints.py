from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import asyncio
import random

router = APIRouter()

# In-memory store for OTPs (For demo purposes only)
# In production, use Redis or a database
otp_store = {}

class AadhaarRequest(BaseModel):
    aadhaar_number: str

class OTPVerifyRequest(BaseModel):
    aadhaar_number: str
    otp: str

@router.post("/send-aadhaar-otp")
async def send_aadhaar_otp(request: AadhaarRequest):
    """
    Simulates sending an OTP to the mobile number linked with Aadhaar.
    """
    # 1. Basic Format Validation
    if not request.aadhaar_number.isdigit() or len(request.aadhaar_number) != 12:
        raise HTTPException(status_code=400, detail="Invalid Aadhaar Number format. Must be 12 digits.")

    # 2. Simulate Latency (Connecting to Government Servers...)
    await asyncio.sleep(1.5)

    # 3. Generate Mock OTP
    # For demo, we fix it to 1234 or random
    mock_otp = "1234" 
    otp_store[request.aadhaar_number] = mock_otp

    return {
        "status": "success",
        "message": "OTP sent successfully to mobile number ending with ******8923", # Mock masked mobile
        "dev_hint": "Use OTP 1234"
    }

@router.post("/verify-aadhaar-otp")
async def verify_aadhaar_otp(request: OTPVerifyRequest):
    """
    Verifies the OTP entered by the user.
    """
    await asyncio.sleep(1.0) # Simulate check

    stored_otp = otp_store.get(request.aadhaar_number)
    
    if not stored_otp:
         raise HTTPException(status_code=400, detail="OTP expired or not requested.")

    if request.otp == stored_otp:
        # Success
        del otp_store[request.aadhaar_number] # Clear OTP
        return {
            "status": "verified",
            "message": "Aadhaar Verified Successfully",
            "verification_token": f"verified_{request.aadhaar_number[-4:]}_" + str(random.randint(1000,9999))
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")
