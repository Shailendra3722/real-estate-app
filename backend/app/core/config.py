from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    CLOUDINARY_CLOUD_NAME: str = "demo"
    CLOUDINARY_API_KEY: str = "00000000000"
    CLOUDINARY_API_SECRET: str = "secret"
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    class Config:
        # env_file = ".env" # Disabled to avoid permission issues, using system env vars
        extra = "ignore" # Ignore other env vars if present

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
