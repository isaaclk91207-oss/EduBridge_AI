"""
Users Routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from core.database import get_async_session
from models.user import User

router = APIRouter()


class UserProfile(BaseModel):
    id: int
    email: str
    username: str | None = None
    full_name: str | None = None
    role: str

    class Config:
        from_attributes = True


@router.get("/profile", response_model=UserProfile)
async def get_profile(session: AsyncSession = Depends(get_async_session)):
    """Get current user profile."""
    # In production, get current user from token
    return UserProfile(
        id=1,
        email="user@example.com",
        username="testuser",
        full_name="Test User",
        role="student"
    )


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    full_name: str | None = None,
    session: AsyncSession = Depends(get_async_session)
):
    """Update user profile."""
    # In production, update current user's profile
    return UserProfile(
        id=1,
        email="user@example.com",
        username="testuser",
        full_name=full_name or "Test User",
        role="student"
    )

