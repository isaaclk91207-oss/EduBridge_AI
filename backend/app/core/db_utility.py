from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.supabase_initialize import async_engine, async_session, Base

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit() 
        except Exception as e:
            await session.rollback() 
            print(f"Error in session: {e}")
            raise
        finally:
            await session.close() 

async def database_initialize():
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            print("Database tables initialized successfully.")
    except Exception as e:
        print(f"Database initialization warning (non-fatal): {e}")