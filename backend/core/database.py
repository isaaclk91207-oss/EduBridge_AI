"""
Database Configuration and Initialization
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from urllib.parse import urlparse, urlunparse, quote_plus

from .config import get_database_url


def _to_async_db_url(url: str) -> str:
    """Convert a PostgreSQL URL to asyncpg format."""
    if not url:
        return ""
    
    # Check if password needs encoding (contains special characters)
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


# Get database URL from environment
DB_URL = get_database_url()
DB_URI = _to_async_db_url(DB_URL)

# Only configure database if URL is available
if DB_URI:
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

    # Create async engine
    async_engine = create_async_engine(DB_URI, connect_args=connect_args, **engine_kwargs)

    # Create async session factory
    async_session = async_sessionmaker(bind=async_engine, expire_on_commit=False, class_=AsyncSession)
else:
    # No database - create dummy objects
    async_engine = None
    async_session = None

# Create declarative base
Base = declarative_base()


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get async database session."""
    if not async_session:
        raise Exception("Database not configured. Please set DATABASE_URL environment variable.")
    
    async with async_session() as session:
        try:
            yield session
        except Exception as e:
            print(f"Error in session: {e}")
            raise


async def database_initialize():
    """Initialize database tables."""
    if not async_engine:
        print("Database not configured - skipping table creation")
        return
    
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Database initialization warning (non-fatal): {e}")

