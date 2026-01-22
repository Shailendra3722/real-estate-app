from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import models
from .db.base import engine

try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Startup DB Error: {e}")
from .api.endpoints import auth

app = FastAPI(
    title="AI Real Estate Finder Engine",
    description="Backend for MapProperties - Verifying Land, Connecting Buyers.",
    version="1.0.0"
)

# CORS Middleware (Allowing all for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .api.endpoints import properties, upload, favorites, auth

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(properties.router, prefix="/properties", tags=["properties"])

from .api.endpoints import verification
app.include_router(verification.router, prefix="/verification", tags=["verification"])

app.include_router(upload.router, prefix="/api", tags=["upload"])

from .api.endpoints import favorites
app.include_router(favorites.router, prefix="/favorites", tags=["favorites"])

@app.get("/")
def read_root():
    return {"message": "AI Real Estate Engine is Running", "status": "active"}

from sqlalchemy import text
from .db.base import get_db
from fastapi import Depends
from sqlalchemy.orm import Session

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        print("Health check passed: DB Connected")
        return {"status": "healthy", "services": {"database": "connected", "verification_engine": "ready"}}
    except Exception as e:
        return {"status": "unhealthy", "services": {"database": str(e), "verification_engine": "ready"}}
