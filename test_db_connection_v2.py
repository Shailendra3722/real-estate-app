
import sqlalchemy
from sqlalchemy import create_engine, text
import os

# usage: psql postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
DATABASE_URL = "postgresql://postgres:LCSed5i8jyMc5cWr@db.orgytehievyrivbgqjqj.supabase.co:5432/postgres?sslmode=require"

try:
    print(f"Connecting to {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Connection successful!")
        for row in result:
            print(row)
except Exception as e:
    print(f"❌ Connection failed: {e}")
