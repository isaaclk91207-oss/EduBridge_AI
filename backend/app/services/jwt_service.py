from fastapi import HTTPException
from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta
from app.core.config import settings
from starlette import status

async def generate_access_token(data: dict) -> str:
    cp_data = data.copy()
    expires_in = datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    cp_data.update({"exp": expires_in, "type": "access"})
    return jwt.encode(cp_data, settings.SECRET_KEY, settings.ALGORITHM)

async def generate_refresh_token(data: dict) -> str:
    cp_data = data.copy()
    expires_in = datetime.now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    cp_data.update({"exp": expires_in, "type": "refresh"})
    return jwt.encode(cp_data, settings.SECRET_KEY, settings.ALGORITHM)

async def decode_token(token:str) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token"
        )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY,algorithms=[settings.ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired"
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
