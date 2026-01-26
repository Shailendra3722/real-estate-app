import psycopg2
import sys

DB_URL = "postgresql://postgres:LCSed5i8jyMc5cWr@db.orgytehievyrivbgqjqj.supabase.co:5432/postgres?sslmode=require"

try:
    print(f"Attempting connection to: {DB_URL.split('@')[1]}")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    cur.execute("SELECT 1")
    print("SUCCESS: Connection established!")
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"FAILURE: {e}")
    sys.exit(1)
