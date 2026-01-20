from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, Enum as SqEnum
from sqlalchemy.orm import relationship
import uuid
import enum
from .base import Base

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    NEEDS_REVIEW = "NEEDS_REVIEW"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    profile_pic = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    aadhaar_hash = Column(String, nullable=True) # Hashed
    
    properties = relationship("Property", back_populates="owner")

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    description = Column(String)
    price_fiat = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(SqEnum(VerificationStatus), default=VerificationStatus.PENDING)
    
    owner = relationship("User", back_populates="properties")
