from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Database URI
DB_URI = settings.SQLALCHEMY_DATABASE_URI or "sqlite+aiosqlite:///./edubridge.db"


engine_kwargs = {
    "echo": False,            # Production အတွက် False ထားရန်
    "pool_pre_ping": True,    # Connection တည်ငြိမ်စေရန်
    "pool_size": 1,           # Vercel (Serverless) အတွက်
    "max_overflow": 0         # Overflow ကို 0 ထားပါ
}


if "postgresql" in DB_URI or "postgres" in DB_URI:
    connect_args = {
        "ssl": "require",
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }
else:
    connect_args = {}


async_engine = create_async_engine(DB_URI, connect_args=connect_args, **engine_kwargs)
async_session = async_sessionmaker(bind=async_engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()