from fastapi import APIRouter, UploadFile, File, HTTPException
from cloudinary.uploader import upload
import cloudinary
import os

router = APIRouter()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload image to Cloudinary and return URL"""
    try:
        # Read file content
        contents = await file.read()
        
        # Upload to Cloudinary
        result = upload(
            contents,
            folder="real-estate",  # Organize images in folder
            resource_type="auto",
            transformation=[
                {'width': 1200, 'height': 800, 'crop': 'limit'},  # Max size
                {'quality': 'auto:good'}  # Auto optimize
            ]
        )
        
        return {
            "url": result['secure_url'],
            "public_id": result['public_id'],
            "thumbnail": result['secure_url'].replace('/upload/', '/upload/w_300,h_200,c_fill/')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
