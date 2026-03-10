import secrets
import os
from urllib.parse import quote_plus
from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


def _encode_password(password: str) -> str:
    """Encode special characters in password using urllib.parse.quote_plus"""
    return quote_plus(password)


def _to_async_db_url(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    
    # Check if password needs encoding (contains special characters like #)
    if "#" in url or "%" in url or "+" in url or "=" in url:
        # Parse the URL and encode the password
        from urllib.parse import urlparse, urlunparse
        
        parsed = urlparse(url)
        
        # Encode the password if it exists
        if parsed.password:
            encoded_password = quote_plus(parsed.password)
            # Rebuild URL with encoded password
            netloc = f"{parsed.username}:{encoded_password}"
            if parsed.hostname:
                if parsed.port:
                    netloc = f"{parsed.username}:{encoded_password}@{parsed.hostname}:{parsed.port}"
                else:
                    netloc = f"{parsed.username}:{encoded_password}@{parsed.hostname}"
            url = urlunparse((parsed.scheme, netloc, parsed.path, parsed.params, parsed.query, parsed.fragment))
    
    # Remove channel_binding if present (not supported by asyncpg)
    url = url.replace("&channel_binding=require", "").replace("channel_binding=require&", "").replace("channel_binding=require", "")
    
    # Convert to asyncpg driver
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    
    # Ensure sslmode=require is present for Neon
    if "sslmode" not in url:
        url = url + "&sslmode=require" if "?" in url else url + "?sslmode=require"
    
    return url


def _get_secret_key() -> str:
    """Generate a 32-character SECRET_KEY"""
    secret = os.getenv("SECRET_KEY")
    if secret and len(secret) >= 32:
        return secret[:32]
    return secrets.token_urlsafe(32)[:32]


class Settings(BaseSettings):
    SECRET_KEY: str = _get_secret_key()
    DATABASE_URL: Optional[str] = None
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"
    COOKIE_SECURE: bool = False
    
    # Supabase settings
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    
    @property
    def async_db_url(self) -> Optional[str]:
        """Get async database URL"""
        if self.DATABASE_URL:
            return _to_async_db_url(self.DATABASE_URL)
        if self.SQLALCHEMY_DATABASE_URI:
            return _to_async_db_url(self.SQLALCHEMY_DATABASE_URI)
        return None


settings = Settings()
