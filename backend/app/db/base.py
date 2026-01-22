from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os

# Check for PostgreSQL database URL from environment
# If not found, fall back to SQLite (for local development)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# PostgreSQL URLs from Render.com use 'postgres://', but SQLAlchemy requires 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create engine based on database type
if DATABASE_URL.startswith("postgresql://"):
    # PostgreSQL - Supabase requires SSL
    engine = create_engine(
        DATABASE_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True, # Handles dropped connections
        pool_size=5,
        max_overflow=10
    )
else:
    # SQLite - needs check_same_thread
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
