from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from starlette import status

from app.core.config import settings
from app.models.psql_model import User
from app.Schemas.schemas import UserLogin, UserRegister
from app.services.jwt_service import generate_access_token, generate_refresh_token
from app.services.password_hashing import hash_password, verify_password


async def get_user_by_email(email: str, session: AsyncSession) -> User | None:
    q = select(User).where(User.email == email)
    result = await session.execute(q)
    return result.scalar_one_or_none()


async def register_user(payload: UserRegister, session: AsyncSession):
    user = await get_user_by_email(payload.email, session)
    if user:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"message": "User already exists"},
        )

    hashed_password = await hash_password(payload.password)
    new_user = User(
        username=payload.username, 
        email=payload.email, 
        password=hashed_password,
        full_name=payload.full_name if hasattr(payload, 'full_name') else "",
        student_type=payload.student_type or "public",
        major=payload.major or ""
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    # Generate tokens - convert UUID to string for JWT
    user_id_str = str(new_user.id)
    access_token = await generate_access_token({"sub": user_id_str, "email": new_user.email})
    refresh_token = await generate_refresh_token({"sub": user_id_str})

    # Convert UUID to string for JSON serialization
    user_id_str = str(new_user.id)
    
    response = JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "message": "User created successfully", 
            "user_id": user_id_str,
            "user": {
                "id": user_id_str,
                "username": new_user.username,
                "email": new_user.email,
                "studentType": new_user.student_type,
                "major": new_user.major
            },
            "access_token": access_token,
            "refresh_token": refresh_token
        },
    )
    
    # Set HTTP-only cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        max_age=60 * 60 * 24 * 7  # 7 days
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        max_age=60 * 60 * 24 * 30  # 30 days
    )
    
    return response


async def login_user(payload: UserLogin, session: AsyncSession):
    user = await get_user_by_email(payload.email, session)
    if not user:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"message": "Invalid email or password"},
        )

    is_valid = await verify_password(payload.password, user.password)
    if not is_valid:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"message": "Invalid email or password"},
        )

    # Convert UUID to string for JWT and JSON serialization
    user_id_str = str(user.id) if user.id else ""
    access_token = await generate_access_token({"sub": user_id_str, "email": user.email})
    refresh_token = await generate_refresh_token({"sub": user_id_str})

    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "access_token": access_token, 
            "refresh_token": refresh_token,
            "user": {
                "id": user_id_str,
                "username": user.username,
                "email": user.email,
                "studentType": user.student_type,
                "major": user.major
            }
        },
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Authorization"] = f"Bearer {access_token}"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["X-Refresh-Token"] = refresh_token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )
    return response


async def forgot_password(email: str, session: AsyncSession, new_password: str):
    user = await get_user_by_email(email, session)
    if not user:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User does not exist"},
        )

    user.password = await hash_password(new_password)
    await session.commit()
    await session.refresh(user)
    return JSONResponse(
        status_code=status.HTTP_200_OK, content={"message": "Password reset"}
    )


async def logout_user(request: Request):
    user = request.cookies.get("access_token")
    if not user:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User does not exist"},
        )

    response = JSONResponse(
        status_code=status.HTTP_200_OK, content={"message": "Logout successful"}
    )
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return response
