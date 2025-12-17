import os
from urllib.parse import urlparse
import psycopg2

# Load .env from project root if available
from pathlib import Path
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parents[1] / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except Exception:
    pass

DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('database_url')
if not DATABASE_URL:
    raise SystemExit('DATABASE_URL is not set in environment/.env')

u = urlparse(DATABASE_URL)
user = u.username or 'postgres'
password = u.password or ''
host = u.hostname or 'localhost'
port = int(u.port or 5432)
dbname = (u.path or '/Resume').lstrip('/')

print(f"Ensuring database '{dbname}' exists on {host}:{port} as user '{user}' ...")

try:
    conn = psycopg2.connect(dbname='postgres', user=user, password=password, host=host, port=port)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute('SELECT 1 FROM pg_database WHERE datname = %s', (dbname,))
    exists = cur.fetchone() is not None
    if not exists:
        cur.execute(f'CREATE DATABASE "{dbname}"')
        print(f"Created database '{dbname}'.")
    else:
        print(f"Database '{dbname}' already exists.")
    cur.close()
    conn.close()
except Exception as e:
    print('Failed to ensure database exists:', e)
    raise

print('OK')
