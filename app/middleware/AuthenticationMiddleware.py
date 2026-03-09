from fastapi import Request
from starlette import status
from starlette.responses import JSONResponse

from backend.app.models.psql_model import User
from backend.app.services.jwt_service import decode_token
from starlette.middleware.base import BaseHTTPMiddleware
from jose import ExpiredSignatureError
from backend.app.core.db_utility import async_session
from sqlalchemy.future import select

EXCLUDED_PATH = ["/", "/openapi.json", "/docs", "/redoc"]
EXCLUDED_PREFIXES = ["/authentication"]

class AuthenticationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path in EXCLUDED_PATH:
            return await call_next(request)
        if any(request.url.path.startswith(prefix) for prefix in EXCLUDED_PREFIXES):
            return await call_next(request)

        if getattr(request.state, "user", None):
            return await call_next(request)

        try:
            access_token = None
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]
            else:
                access_token = request.cookies.get("access_token")

            payload = await decode_token(access_token)
            if not payload:
                return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"error": "Invalid token"})

            uuid = int(payload.get("sub"))
            if uuid is None:
                return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"error": "Invalid token"})

        except ExpiredSignatureError:
            return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content={"error": "Token expired!"})
        except Exception as e:
            return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"error": str(e)})

        async with async_session() as session:
            user = await session.execute(select(User).where(User.id == uuid))
            res = user.scalars().first()
            if res is None:
                return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"error": "User not found"})

        request.state.user = res
        return await call_next(request)


