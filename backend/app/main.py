from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import models
from .db.base import engine

models.Base.metadata.create_all(bind=engine)
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

app.include_router(auth.router, prefix="/auth", tags=["auth"])
from .api.endpoints import properties
app.include_router(properties.router, prefix="/properties", tags=["properties"])

from .api.endpoints import verification
app.include_router(verification.router, prefix="/verification", tags=["verification"])

from .api.endpoints import upload
app.include_router(upload.router, prefix="/api", tags=["upload"])

from .api.endpoints import favorites
app.include_router(favorites.router, prefix="/favorites", tags=["favorites"])

@app.get("/")
def read_root():
    return {"message": "AI Real Estate Engine is Running", "status": "active"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "services": {"database": "unknown", "verification_engine": "ready"}}
