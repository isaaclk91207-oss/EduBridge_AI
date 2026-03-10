from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Use SQLite as fallback if no database URL is provided
DB_URI = settings.SQLALCHEMY_DATABASE_URI or "sqlite+aiosqlite:///./edubridge.db"

# Configure connect_args based on database type
# For Supabase Pooler (port 6543), we need SSL and disabled prepared statements
connect_args = {}
engine_kwargs = {"echo": True}

if "postgresql" in DB_URI or "postgres" in DB_URI:
    # For Supabase pooler with asyncpg, disable prepared statement caching
    # This fixes DuplicatePreparedStatementError with connection pooler
    connect_args = {
        "ssl": "require",  # Use SSL for Supabase pooler
        "statement_cache_size": 0,  # Disable prepared statement caching for pooler
    }
    # Add pool_pre_ping for connection stability with pooler
    engine_kwargs["pool_pre_ping"] = True
    # Add pool settings for better connection management
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10

async_engine = create_async_engine(DB_URI, connect_args=connect_args, **engine_kwargs)
async_session = async_sessionmaker(bind=async_engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()
