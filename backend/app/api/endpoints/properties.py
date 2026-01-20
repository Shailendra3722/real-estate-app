from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ...db.base import get_db
from ...db.models import Property, User, VerificationStatus
import uuid

router = APIRouter()

# Schema
class PropertyCreate(BaseModel):
    title: str
    description: str
    price: float
    latitude: float
    longitude: float

class PropertyResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    description: str
    price_fiat: float
    latitude: float
    longitude: float
    status: VerificationStatus

    class Config:
        orm_mode = True

@router.post("/", response_model=PropertyResponse)
def create_property(prop: PropertyCreate, db: Session = Depends(get_db)):
    # Mock owner for now (should get from Current User)
    dummy_email = "test@example.com"
    user = db.query(User).filter(User.email == dummy_email).first()
    if not user:
        # Should be handled by consistent auth state, but for safety:
        user = User(email=dummy_email, full_name="Test User", id=str(uuid.uuid4()))
        db.add(user)
        db.commit()
    
    db_prop = Property(
        id=str(uuid.uuid4()),
        owner_id=user.id,
        title=prop.title,
        description=prop.description,
        price_fiat=prop.price,
        latitude=prop.latitude,
        longitude=prop.longitude,
        status=VerificationStatus.PENDING
    )
    db.add(db_prop)
    db.commit()
    db.refresh(db_prop)
    return db_prop

@router.get("/nearby", response_model=List[PropertyResponse])
def get_nearby_properties(lat: float, long: float, radius_km: float = 5.0, db: Session = Depends(get_db)):
    # TODO: Implement Geo-spatial filter
    # For MVP: Return all to populate the map
    return db.query(Property).all()

@router.get("/{id}", response_model=PropertyResponse)
def get_property(id: str, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop
