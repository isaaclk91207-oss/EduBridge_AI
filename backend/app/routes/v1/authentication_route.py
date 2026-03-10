from fastapi import APIRouter, Depends, Request

from app.Schemas.schemas import ForgotPasswordRequest, UserLogin, UserRegister
from app.core.db_utility import get_async_session
from app.services.authentication_service import (
    forgot_password,
    login_user as login_user_service,
    logout_user as logout_user_service,
    register_user as register_user_service,
)

router = APIRouter(prefix="/authentication", tags=["authentication"])


@router.post("/register")
async def register(user: UserRegister, session=Depends(get_async_session)):
    return await register_user_service(user, session)


@router.post("/login")
async def login(user: UserLogin, session = Depends(get_async_session)):
    return await login_user_service(user, session)


@router.post("/forgot-password")
async def reset_password(payload: ForgotPasswordRequest, session=Depends(get_async_session)):
    return await forgot_password(payload.email, session, payload.new_password)


@router.post("/logout")
async def logout(request: Request):
    return await logout_user_service(request)


@router.get("/login")
async def check_auth(request: Request):
    """Check if user is authenticated - returns current user if token is valid"""
    from backend.app.services.jwt_service import decode_token
    
    # Try to get token from cookie or header
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        return {"authenticated": False}
    
    try:
        payload = await decode_token(token)
        return {
            "authenticated": True,
            "user_id": payload.get("sub"),
            "email": payload.get("email")
        }
    except Exception:
        return {"authenticated": False}
