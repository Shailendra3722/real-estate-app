from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ...db.base import get_db
from ...db.models import Property, User, VerificationStatus
import uuid

router = APIRouter()

# Schema
class PropertyCreate(BaseModel):
    title: str
    description: str
    property_type: str
    price: float
    area: Optional[float] = None
    area_unit: Optional[str] = None
    latitude: float
    longitude: float
    mobile: Optional[str] = None
    image_urls: Optional[List[str]] = None
    user_email: Optional[str] = "test@example.com" # Default for now, but client should send it

class PropertyResponse(BaseModel):
    id: str
    owner_id: str
    owner_name: Optional[str] = None
    owner_is_verified: Optional[bool] = False
    title: str
    description: str
    property_type: Optional[str] = None
    price_fiat: float
    area: Optional[float] = None
    area_unit: Optional[str] = None
    latitude: float
    longitude: float
    mobile: Optional[str] = None
    image_urls: Optional[List[str]] = None
    status: VerificationStatus
    
    # Ultra Advanced AI Fields
    ai_valuation_min: Optional[float] = 0.0
    ai_valuation_max: Optional[float] = 0.0
    ai_valuation_verdict: Optional[str] = "Unknown"
    investment_score: Optional[float] = 0.0

    # Hyper-Local Intelligence Fields
    walk_score: Optional[int] = 0
    safety_index: Optional[int] = 0
    nearby_schools: Optional[int] = 0
    nearby_hospitals: Optional[int] = 0
    nearby_parks: Optional[int] = 0
    
    # Market Trends
    price_history: Optional[List[dict]] = None # List of {year: int, price: int}

    # Infinity Tier Features
    is_360_ready: Optional[bool] = False
    
    # Fractional Ownership
    is_fractional: Optional[bool] = False
    token_price: Optional[float] = 0.0
    total_tokens: Optional[int] = 1000
    sold_tokens: Optional[int] = 0
    yield_rate: Optional[float] = 0.0

    # Live Auction
    is_auction: Optional[bool] = False
    auction_end_time: Optional[str] = None # ISO Format
    current_bid: Optional[float] = 0.0
    total_bids: Optional[int] = 0

    # Galactic Tier Features
    facing: Optional[str] = None # North, South-East etc
    vastu_score: Optional[int] = 0

    # Cosmic Tier Features
    noise_level: Optional[str] = "Moderate"
    decibels: Optional[int] = 60

    # Universal Tier Features
    is_blockchain_verified: Optional[bool] = False
    contract_address: Optional[str] = None
    
    class Config:
        orm_mode = True

from .auth import get_current_user # Import dependency

@router.post("/", response_model=PropertyResponse)
def create_property(prop: PropertyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_prop = Property(
        id=str(uuid.uuid4()),
        owner_id=current_user.id, # Link to real user
        title=prop.title,
        description=prop.description,
        property_type=prop.property_type,
        price_fiat=prop.price,
        area=prop.area,
        area_unit=prop.area_unit,
        latitude=prop.latitude,
        longitude=prop.longitude,
        mobile=prop.mobile,
        image_urls=prop.image_urls,
        status=VerificationStatus.PENDING
    )
    db.add(db_prop)
    db.commit()
    db.refresh(db_prop)
    
    # Manually populate owner fields for response
    response_obj = db_prop
    response_obj.owner_name = current_user.full_name
    response_obj.owner_is_verified = current_user.is_verified
    
    # Defaults
    calculate_ai_insights(response_obj)

    return response_obj


def calculate_ai_insights(prop: Property):
    # Mock AI Logic
    base_price = prop.price_fiat
    # Deterministic randomness based on ID
    seed = abs(hash(prop.id)) % 100
    
    # 1. Valuation
    prop.ai_valuation_min = base_price * 0.9
    prop.ai_valuation_max = base_price * 1.15
    
    if prop.price_fiat < prop.ai_valuation_min:
        prop.ai_valuation_verdict = "Underpriced (Steal!)"
    elif prop.price_fiat > prop.ai_valuation_max:
        prop.ai_valuation_verdict = "Overpriced"
    else:
        prop.ai_valuation_verdict = "Fair Market Price"
        
    # 2. Investment Score (0-10)
    score = 7.0
    if prop.property_type in ["Commercial", "Plot"]:
        score += 1.5
    if prop.price_fiat < 5000000:
        score += 1.0
    prop.investment_score = min(score, 10.0)

    # 3. Neighborhood Stats
    prop.walk_score = 60 + (seed % 40)
    prop.safety_index = 7 + (seed % 3)
    prop.nearby_schools = 2 + (seed % 4)
    prop.nearby_hospitals = 1 + (seed % 3)
    prop.nearby_parks = 1 + (seed % 5)

    # 4. Price History
    y3 = base_price * 0.85
    y2 = base_price * 0.92
    y1 = base_price
    prop.price_history = [
        {"year": 2023, "price": int(y3)},
        {"year": 2024, "price": int(y2)},
        {"year": 2025, "price": int(y1)}
    ]

    # 5. Infinity Features
    prop.is_360_ready = base_price > 5000000

    if prop.property_type == "Commercial" and base_price > 10000000:
        prop.is_fractional = True
        prop.token_price = 5000
        prop.total_tokens = int(base_price / 5000)
        prop.sold_tokens = int(prop.total_tokens * ((seed % 80) / 100))
        prop.yield_rate = 8.5 + (seed % 40) / 10.0

    if seed % 5 == 0: 
        prop.is_auction = True
        prop.current_bid = base_price * 1.05
        prop.total_bids = 12 + (seed % 20)
        from datetime import datetime, timedelta
        prop.auction_end_time = (datetime.utcnow() + timedelta(hours=24)).isoformat()

    # 6. Galactic Features
    directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]
    prop.facing = directions[seed % 8]
    
    if prop.facing in ["North", "North-East", "East"]:
        prop.vastu_score = 9 + (seed % 2)
    else:
        prop.vastu_score = 6 + (seed % 4)

    # 7. Cosmic Tier Features
    if prop.safety_index > 8:
        prop.noise_level = "Whisper Quiet"
        prop.decibels = 35 + (seed % 10)
    elif prop.safety_index > 6:
        prop.noise_level = "Urban Buzz"
        prop.decibels = 50 + (seed % 15)
    else:
        prop.noise_level = "Traffic Heavy"
        prop.decibels = 70 + (seed % 10)

    # 8. Universal Tier Features (Mock)
    # Most expensive props get Blockchain verification
    if base_price > 7500000:
        prop.is_blockchain_verified = True
        # Mock Eth Address
        prop.contract_address = f"0x{hash(prop.id):040x}"[:18] + "..." + f"0x{hash(prop.id):040x}"[-4:]

@router.get("/all", response_model=List[PropertyResponse])
def get_all_properties(db: Session = Depends(get_db)):
    """Get all properties for Browse/Buy screen"""
    props = db.query(Property).all()
    # Enrich with owner info
    for p in props:
        if p.owner:
            p.owner_name = p.owner.full_name
            p.owner_is_verified = p.owner.is_verified
        calculate_ai_insights(p)
    return props

@router.get("/nearby", response_model=List[PropertyResponse])
def get_nearby_properties(lat: float, long: float, radius_km: float = 5.0, db: Session = Depends(get_db)):
    # TODO: Implement Geo-spatial filter
    # For MVP: Return all to populate the map
    props = db.query(Property).all()
    for p in props:
        if p.owner:
            p.owner_name = p.owner.full_name
            p.owner_is_verified = p.owner.is_verified
        calculate_ai_insights(p)
    return props

@router.get("/{id}", response_model=PropertyResponse)
def get_property(id: str, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if prop.owner:
        prop.owner_name = prop.owner.full_name
        prop.owner_is_verified = prop.owner.is_verified
    
    calculate_ai_insights(prop)
    
    return prop

@router.get("/{id}/similar", response_model=List[PropertyResponse])
def get_similar_properties(id: str, db: Session = Depends(get_db)):
    """Get similar properties based on type and price range"""
    original = db.query(Property).filter(Property.id == id).first()
    if not original:
        return []
        
    # Logic: Same Type, Price within +/- 30%
    min_price = original.price_fiat * 0.7
    max_price = original.price_fiat * 1.3
    
    similar = db.query(Property).filter(
        Property.property_type == original.property_type,
        Property.price_fiat >= min_price,
        Property.price_fiat <= max_price,
        Property.id != id # Exclude self
    ).limit(3).all()
    
    for p in similar:
        if p.owner:
            p.owner_name = p.owner.full_name
            p.owner_is_verified = p.owner.is_verified
            
    return similar

@router.get("/user/{email}", response_model=List[PropertyResponse])
def get_user_properties(email: str, db: Session = Depends(get_db)):
    """Get all properties listed by a specific user (by email)"""
    # First find user by email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # If user doesn't exist in DB, they haven't listed anything
        return []
    
    props = db.query(Property).filter(Property.owner_id == user.id).all()
    for p in props:
        p.owner_name = user.full_name
        p.owner_is_verified = user.is_verified
    return props

@router.delete("/{id}")
def delete_property(id: str, user_email: str, db: Session = Depends(get_db)):
    """Delete a property listing - Secure Owner Check"""
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Verify Owner
    # 1. Get User by Email
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    # 2. Check if Property Owner ID matches User ID
    if prop.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to delete this property")
    
    db.delete(prop)
    db.commit()
    return {"message": "Property deleted successfully"}
