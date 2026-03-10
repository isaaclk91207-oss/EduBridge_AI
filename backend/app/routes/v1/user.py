from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from starlette import status

from app.core.db_utility import get_async_session
from app.models.psql_model import User
from app.services.jwt_service import decode_token

router = APIRouter(prefix="/user", tags=["user"])


async def get_current_user(request: Request, session: AsyncSession) -> User:
    """Get current user from JWT token"""
    # Try to get token from cookie first, then from Authorization header
    token = request.cookies.get("access_token")
    
    if not token:
        # Try Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Decode token
    payload = await decode_token(token)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Get user from database (user_id from JWT is string)
    result = await session.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/profile")
async def get_profile(
    request: Request,
    session: AsyncSession = Depends(get_async_session)
):
    """Get user profile - requires JWT authentication"""
    try:
        user = await get_current_user(request, session)
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "studentType": user.student_type,
            "major": user.major,
            "createdAt": user.created_at.isoformat() if user.created_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching profile: {str(e)}"
        )


@router.put("/profile")
async def update_profile(
    request: Request,
    session: AsyncSession = Depends(get_async_session)
):
    """Update user profile - requires JWT authentication"""
    try:
        user = await get_current_user(request, session)
        
        # Get request body
        body = await request.json()
        
        # Update fields if provided
        if "firstName" in body or "lastName" in body:
            name_parts = body.get("firstName", ""), body.get("lastName", "")
            user.username = " ".join(filter(None, name_parts)) or user.username
        
        if "major" in body:
            user.major = body["major"]
        
        if "studentType" in body:
            user.student_type = body["studentType"]
        
        if "email" in body:
            # Check if email is already taken
            result = await session.execute(
                select(User).where(User.email == body["email"], User.id != user.id)
            )
            existing_user = result.scalar_one_or_none()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already in use"
                )
            user.email = body["email"]
        
        await session.commit()
        await session.refresh(user)
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "studentType": user.student_type,
                "major": user.major
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )
