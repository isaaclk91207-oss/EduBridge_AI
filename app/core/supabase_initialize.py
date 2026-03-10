from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
import os

# Read DATABASE_URL directly from environment - bypass any caching issues
DATABASE_URL = os.environ.get("DATABASE_URL") or os.getenv("DATABASE_URL")
SQLALCHEMY_DATABASE_URI = os.environ.get("SQLALCHEMY_DATABASE_URI") or os.getenv("SQLALCHEMY_DATABASE_URI")

# Use DATABASE_URL if available, otherwise fall back to SQLALCHEMY_DATABASE_URI
DB_URL = DATABASE_URL or SQLALCHEMY_DATABASE_URI

# Debug: Print what we're getting
print(f"DEBUG: DATABASE_URL env var: {DATABASE_URL}")
print(f"DEBUG: SQLALCHEMY_DATABASE_URI env var: {SQLALCHEMY_DATABASE_URI}")
print(f"DEBUG: DB_URL after checks: {DB_URL}")

# If no database URL is set, raise an error
if not DB_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please configure DATABASE_URL in your Vercel environment variables. "
        "For Neon PostgreSQL, use: postgresql://user:password@host.neon.tech/db?sslmode=require"
    )

# Check for SQLite - we don't support SQLite on Vercel
if "sqlite" in DB_URL.lower():
    raise ValueError(
        f"SQLite is not supported on Vercel. Please configure DATABASE_URL with a PostgreSQL connection string. "
        f"Current value: {DB_URL}"
    )

# Convert to async URL if needed
def _to_async_db_url(url: str) -> str:
    from urllib.parse import urlparse, urlunparse, quote_plus
    
    # Check if password needs encoding (contains special characters like #)
    parsed = urlparse(url)
    if parsed.password and ("#" in parsed.password or "%" in parsed.password or "+" in parsed.password or "=" in parsed.password):
        encoded_password = quote_plus(parsed.password)
        netloc = f"{parsed.username}:{encoded_password}"
        if parsed.hostname:
            if parsed.port:
                netloc = f"{parsed.username}:{encoded_password}@{parsed.hostname}:{parsed.port}"
            else:
                netloc = f"{parsed.username}:{encoded_password}@{parsed.hostname}"
        url = urlunparse((parsed.scheme, netloc, parsed.path, parsed.params, parsed.query, parsed.fragment))
    
    # Remove channel_binding if present (not supported by asyncpg)
    url = url.replace("&channel_binding=require", "").replace("channel_binding=require&", "").replace("channel_binding=require", "")
    
    # Convert to asyncpg driver
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    
    # Ensure sslmode=require is present for Neon
    if "sslmode" not in url:
        url = url + "&sslmode=require" if "?" in url else url + "?sslmode=require"
    
    return url

DB_URI = _to_async_db_url(DB_URL)
print(f"DEBUG: Final DB_URI: {DB_URI[:50]}..." if DB_URI else "DEBUG: Final DB_URI: None")

# Configure connect_args based on database type
connect_args = {}
engine_kwargs = {
    "echo": False,
    "pool_pre_ping": True,
}

if "postgresql" in DB_URI or "postgres" in DB_URI:
    connect_args = {
        "ssl": "require",
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }
    engine_kwargs["pool_size"] = 1
    engine_kwargs["max_overflow"] = 0

async_engine = create_async_engine(DB_URI, connect_args=connect_args, **engine_kwargs)
async_session = async_sessionmaker(bind=async_engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

