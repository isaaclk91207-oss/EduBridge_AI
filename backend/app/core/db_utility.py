from typing import AsyncGenerator

from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.supabase_initialize import async_engine, async_session, Base

async def get_async_session() -> AsyncGenerator[AsyncSession,None]:
    async_session_local = async_session
    async with async_session_local() as session:
        try:
            yield session
        except Exception as e:
            print(f"Error in session: {e}")
            raise

async def database_initialize():
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Database initialization warning (non-fatal): {e}")
