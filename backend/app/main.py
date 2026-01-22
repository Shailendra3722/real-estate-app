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
    from .db.base import db_startup_error, engine
    
    status = "healthy"
    db_status = "connected"
    
    if db_startup_error:
        status = "degraded"
        db_status = f"fallback_active_error_{db_startup_error}"
    
    try:
        # Check actual connection
        db.execute(text("SELECT 1"))
    except Exception as e:
        status = "unhealthy"
        db_status = f"disconnected_{e}"

    return {
        "status": status, 
        "services": {
            "database": db_status, 
            "verification_engine": "ready",
            "backend_version": "v2_safe_mode"
        }
    }
