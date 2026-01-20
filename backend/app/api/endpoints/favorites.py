from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ...db.base import get_db
from ...db.models import Favorite, Property, User
import uuid

router = APIRouter()

class FavoriteCreate(BaseModel):
    property_id: str
    user_email: str  # Using email for now since we don't have real auth

class FavoriteResponse(BaseModel):
    id: str
    user_id: str
    property_id: str

    class Config:
        orm_mode = True

@router.post("/add", response_model=FavoriteResponse)
def add_favorite(fav: FavoriteCreate, db: Session = Depends(get_db)):
    """Add property to favorites"""
    # Get or create user
    user = db.query(User).filter(User.email == fav.user_email).first()
    if not user:
        user = User(email=fav.user_email, full_name="User", id=str(uuid.uuid4()))
        db.add(user)
        db.commit()
    
    # Check if already favorited
    existing = db.query(Favorite).filter(
        Favorite.user_id == user.id,
        Favorite.property_id == fav.property_id
    ).first()
    
    if existing:
        return existing
    
    # Create favorite
    favorite = Favorite(
        id=str(uuid.uuid4()),
        user_id=user.id,
        property_id=fav.property_id
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite

@router.delete("/remove/{property_id}")
def remove_favorite(property_id: str, user_email: str, db: Session = Depends(get_db)):
    """Remove property from favorites"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    favorite = db.query(Favorite).filter(
        Favorite.user_id == user.id,
        Favorite.property_id == property_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    return {"message": "Removed from favorites"}

@router.get("/list", response_model=List[dict])
def get_favorites(user_email: str, db: Session = Depends(get_db)):
    """Get all favorite properties for user"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        return []
    
    favorites = db.query(Favorite).filter(Favorite.user_id == user.id).all()
    
    # Get full property details
    properties = []
    for fav in favorites:
        prop = db.query(Property).filter(Property.id == fav.property_id).first()
        if prop:
            properties.append({
                "id": prop.id,
                "title": prop.title,
                "price_fiat": prop.price_fiat,
                "property_type": prop.property_type,
                "image_urls": prop.image_urls,
                "latitude": prop.latitude,
                "longitude": prop.longitude,
                "area": prop.area,
                "area_unit": prop.area_unit
            })
    
    return properties
