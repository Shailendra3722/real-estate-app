import psycopg2
import sys

# Connection string from render.yaml
DB_URL = "postgresql://postgres:LCSed5i8jyMc5cWr@db.orgytehievyrivbgqjqj.supabase.co:5432/postgres?sslmode=require"

try:
    print("Connecting...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    # Query to list tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    
    tables = cur.fetchall()
    print("Tables found:", [t[0] for t in tables])
    
    if 'users' in [t[0] for t in tables]:
        print("✅ Users table exists")
    else:
        print("❌ Users table MISSING")
        
    conn.close()

except Exception as e:
    print(f"Connection Failed: {e}")
