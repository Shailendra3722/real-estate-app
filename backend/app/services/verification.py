import re
import random
from PIL import Image, ImageStat
from io import BytesIO

class VerificationEngine:
    """
    The 'Strict' Verification Engine.
    Simulates Government-level checks + Image Quality Analysis.
    """
    
    @staticmethod
    def check_image_quality(image_bytes: bytes) -> dict:
        """
        Analyzes image for Blur and Brightness.
        """
        try:
            img = Image.open(BytesIO(image_bytes))
            # Convert to grayscale for analysis
            gray = img.convert('L')
            
            # 1. Blur Detection (Variance of Laplacian simulation using simple stat)
            # Real simplified: Standard Deviation of pixel intensity. Low std dev = likely flat/blurry or blank.
            stat = ImageStat.Stat(gray)
            std_dev = stat.stddev[0]
            
            # 2. Brightness
            mean_brightness = stat.mean[0]
            
            is_blurry = std_dev < 15 # Arbitrary threshold for demo
            is_dark = mean_brightness < 40
            
            score = 100
            if is_blurry: score -= 40
            if is_dark: score -= 30
            
            return {
                "score": score,
                "is_blurry": is_blurry,
                "is_dark": is_dark,
                "details": f"Brightness: {int(mean_brightness)}, Detail: {int(std_dev)}"
            }
        except Exception as e:
            return {"score": 0, "error": str(e)}

    @staticmethod
    def validate_id_format(id_type: str, id_number: str) -> bool:
        """
        Regex strict checking for Indian IDs.
        """
        if id_type == "AADHAAR":
            # 12 digits, doesn't start with 0 or 1
            pattern = r"^[2-9]{1}[0-9]{11}$"
        elif id_type == "PAN":
            # 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
            pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
        else:
            return True # Unknown type
            
        return bool(re.match(pattern, id_number))

    @staticmethod
    def obscure_id(id_number: str) -> str:
        """
        Masks ID for privacy.
        """
        if len(id_number) < 4: return "****"
        return "*" * (len(id_number) - 4) + id_number[-4:]

verification_engine = VerificationEngine()
