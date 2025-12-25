import pymysql
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

db_name = os.getenv('DB_NAME', 'TICKET_BOX')
db_user = os.getenv('DB_USER', 'root')
db_password = os.getenv('DB_PASSWORD', '12345678')
db_host = os.getenv('DB_HOST', '127.0.0.1')
db_port = int(os.getenv('DB_PORT', '3306'))

print(f"Connecting to MySQL at {db_host}:{db_port} as {db_user}...")
try:
    conn = pymysql.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        port=db_port
    )
    with conn.cursor() as cursor:
        print(f"Creating database {db_name} if not exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
    conn.commit()
    conn.close()
    print("Database check/creation successful.")
except Exception as e:
    print(f"FAILED to create database: {e}")
    exit(1)
