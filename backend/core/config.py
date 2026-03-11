"""
Configuration Settings
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App settings
    APP_NAME: str = "EduBridge AI API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Frontend URL
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    # Database - Support both DATABASE_URL and SQLALCHEMY_DATABASE_URI
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "")
    SQLALCHEMY_DATABASE_URI: str = os.environ.get("SQLALCHEMY_DATABASE_URI", "")
    
    # Supabase
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY", "")
    
    # JWT
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External APIs
    OPENAI_API_KEY: str = os.environ.get("OPENAI_API_KEY", "")
    GOOGLE_API_KEY: str = os.environ.get("GOOGLE_API_KEY", "")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()


def get_database_url() -> str:
    """Get the database URL, checking multiple environment variables."""
    # Use DATABASE_URL if available, otherwise fall back to SQLALCHEMY_DATABASE_URI
    db_url = settings.DATABASE_URL or settings.SQLALCHEMY_DATABASE_URI
    
    if not db_url:
        raise ValueError(
            "DATABASE_URL environment variable is not set. "
            "Please configure DATABASE_URL in your environment variables. "
            "For Neon PostgreSQL, use: postgresql://user:password@host.neon.tech/db?sslmode=require"
        )
    
    # Check for SQLite - not supported on production
    if "sqlite" in db_url.lower():
        raise ValueError(
            "SQLite is not supported in production. Please use PostgreSQL."
        )
    
    return db_url

