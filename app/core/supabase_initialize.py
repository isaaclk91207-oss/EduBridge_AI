from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings
import os

# Use the async_db_url property which properly handles DATABASE_URL
# Falls back to None if no database URL is configured
DB_URI = settings.async_db_url

# Debug: Print what DB_URI is (for troubleshooting)
print(f"DEBUG: DATABASE_URL env var: {os.getenv('DATABASE_URL')}")
print(f"DEBUG: SQLALCHEMY_DATABASE_URI env var: {os.getenv('SQLALCHEMY_DATABASE_URI')}")
print(f"DEBUG: DB_URI after settings: {DB_URI}")

# If no database URL is set or contains sqlite, raise an error
if not DB_URI:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please configure DATABASE_URL in your Vercel environment variables. "
        "For Neon PostgreSQL, use: postgresql://user:password@host.neon.tech/db?sslmode=require"
    )

# Check for SQLite - we don't support SQLite on Vercel
if "sqlite" in DB_URI.lower():
    raise ValueError(
        f"SQLite is not supported on Vercel. Please configure DATABASE_URL with a PostgreSQL connection string. "
        f"Current value: {DB_URI}"
    )

# Configure connect_args based on database type
connect_args = {}
engine_kwargs = {
    "echo": False,  # Set to True for debugging
    "pool_pre_ping": True,  # Check connections before using
}

if "postgresql" in DB_URI or "postgres" in DB_URI:
    # For Neon/Supabase pooler with asyncpg
    connect_args = {
        "ssl": "require",  # Use SSL for Neon
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }
    # Pool settings for serverless (Vercel)
    engine_kwargs["pool_size"] = 1
    engine_kwargs["max_overflow"] = 0

async_engine = create_async_engine(DB_URI, connect_args=connect_args, **engine_kwargs)
async_session = async_sessionmaker(bind=async_engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()
