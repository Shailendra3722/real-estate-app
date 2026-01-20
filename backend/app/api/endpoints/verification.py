from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from ...db.base import get_db
from ...db.models import Property, User, VerificationStatus
from ...services.verification import verification_engine
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_verification_doc(
    doc_type: str = Form(...), # AADHAAR, PAN, SELFIE
    id_number: str = Form(...), # The number typed by user
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Submits a document for AI Verification.
    Returns the 'AI Score' immediately.
    """
    
    # 1. Read File
    contents = await file.read()
    
    # 2. Image Quality Check
    quality_result = verification_engine.check_image_quality(contents)
    
    # 3. ID Format Check
    valid_format = verification_engine.validate_id_format(doc_type, id_number)
    
    # 4. Final Scoring Logic
    final_status = VerificationStatus.PENDING
    rejection_reason = None
    
    if quality_result["score"] < 50:
        final_status = VerificationStatus.REJECTED
        rejection_reason = f"Image Quality too low. {quality_result['details']}"
    elif not valid_format:
        final_status = VerificationStatus.REJECTED
        rejection_reason = f"Invalid {doc_type} Number Format."
    else:
        # High quality and valid format -> Auto Approve for MVP
        final_status = VerificationStatus.APPROVED
        
    return {
        "doc_type": doc_type,
        "masked_id": verification_engine.obscure_id(id_number),
        "ai_score": quality_result["score"],
        "quality_details": quality_result,
        "format_valid": valid_format,
        "status": final_status,
        "rejection_reason": rejection_reason
    }
