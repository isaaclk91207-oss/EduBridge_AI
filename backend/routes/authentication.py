"""
Authentication Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from core.database import get_async_session
from models.user import User

router = APIRouter()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Pydantic Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str | None = None
    password: str
    full_name: str | None = None


class UserResponse(BaseModel):
    id: int
    email: str
    username: str | None = None
    full_name: str | None = None
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# Mock user database for demonstration
MOCK_USERS = {}


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, session: AsyncSession = Depends(get_async_session)):
    """Register a new user."""
    # Check if user exists
    if user.email in MOCK_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # In production, hash the password here
    MOCK_USERS[user.email] = {
        "email": user.email,
        "username": user.username,
        "password": user.password,  # In production: hash this!
        "full_name": user.full_name,
        "role": "student"
    }
    
    return UserResponse(
        id=len(MOCK_USERS),
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role="student"
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user and return access token."""
    # In production, verify against database
    user = MOCK_USERS.get(form_data.username)
    
    if not user or user["password"] != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # In production, generate real JWT token
    access_token = f"mock_token_{form_data.username}"
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user info."""
    # In production, decode JWT token and fetch user
    # For now, return mock data
    return UserResponse(
        id=1,
        email="user@example.com",
        username="testuser",
        full_name="Test User",
        role="student"
    )

