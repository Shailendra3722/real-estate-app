from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    
    # Database (optional if we want to move it here too, but focusing on Cloudinary for now)
    # DATABASE_URL: str = "sqlite:///./sql_app.db"

    class Config:
        env_file = ".env"
        extra = "ignore" # Ignore other env vars if present

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
