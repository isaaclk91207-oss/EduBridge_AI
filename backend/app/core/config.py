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
        return url
    
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
    
    # Convert to asyncpg driver
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    
    # For Supabase pooler, keep sslmode=require in the URL
    # asyncpg supports sslmode parameter directly
    
    return url

def _get_secret_key() -> str:
    """Generate a 32-character SECRET_KEY"""
    secret = os.getenv("SECRET_KEY")
    if secret and len(secret) >= 32:
        return secret[:32]  # Use first 32 characters
    # Generate new 32-character key
    return secrets.token_urlsafe(32)[:32]

class Settings(BaseSettings):
    SECRET_KEY: str = _get_secret_key()
    DATABASE_URL: Optional[str] = os.environ.get("DATABASE_URL")
    SQLALCHEMY_DATABASE_URI: Optional[str] = _to_async_db_url(
        os.environ.get("SQLALCHEMY_DATABASE_URI") or os.environ.get("DATABASE_URL")
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 30))
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    
    # Supabase settings
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")

settings = Settings()
