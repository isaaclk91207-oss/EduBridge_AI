import uuid
import datetime

from sqlalchemy import String, DateTime, Column, func, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID
from app.core.supabase_initialize import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    full_name = Column(String, default="")
    major = Column(String, default="")
    student_type = Column(String, default="public")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Add indexes for faster lookups
    __table_args__ = (
        Index('ix_users_email', 'email'),
        Index('ix_users_username', 'username'),
    )

