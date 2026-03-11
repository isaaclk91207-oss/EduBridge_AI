import uuid
import datetime
from typing import Optional, List

from sqlalchemy import String, DateTime, Column, func, Boolean, Index, Integer, Text, Numeric, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship, declarative_base
from core.supabase_initialize import Base


# =============================================================================
# USER MODEL
# =============================================================================
class User(Base):
    """
    User model for authentication and profile management
    """
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # Hashed password
    full_name = Column(String(255), default="")
    username = Column(String(100), unique=True, nullable=True, index=True)
    major = Column(String(255), default="")
    student_type = Column(String(50), default="public")
    avatar_url = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Table args for indexes
    __table_args__ = (
        Index('ix_users_email', 'email'),
        Index('ix_users_username', 'username'),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, username={self.username})>"


# =============================================================================
# COURSES MODEL
# =============================================================================
class Course(Base):
    """
    Course model for storing course information
    """
    __tablename__ = "courses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    instructor = Column(String(255), nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    duration = Column(String(50), nullable=True)
    level = Column(String(50), default="beginner")
    category = Column(String(100), nullable=True)
    price = Column(Numeric(10, 2), default=0)
    is_published = Column(Boolean, default=False)
    skills_covered = Column(ARRAY(String), default=[])
    requirements = Column(ARRAY(String), default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('ix_courses_title', 'title'),
        Index('ix_courses_category', 'category'),
        Index('ix_courses_level', 'level'),
    )
    
    def __repr__(self):
        return f"<Course(id={self.id}, title={self.title}, category={self.category})>"


# =============================================================================
# COURSE ENROLLMENT MODEL
# =============================================================================
class CourseEnrollment(Base):
    """
    Course Enrollment model - tracks user enrollments in courses
    """
    __tablename__ = "course_enrollments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    progress = Column(Integer, default=0)
    completed_lessons = Column(ARRAY(String), default=[])
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    __table_args__ = (
        Index('ix_enrollments_user_course', 'user_id', 'course_id', unique=True),
    )
    
    def __repr__(self):
        return f"<CourseEnrollment(user_id={self.user_id}, course_id={self.course_id}, progress={self.progress})>"


# =============================================================================
# CAREER MODEL
# =============================================================================
class Career(Base):
    """
    Career model for storing career paths and opportunities
    """
    __tablename__ = "careers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    career_path = Column(Text, nullable=True)
    skills_required = Column(ARRAY(String), default=[])
    skills_recommended = Column(ARRAY(String), default=[])
    salary_range_low = Column(Integer, nullable=True)
    salary_range_high = Column(Integer, nullable=True)
    job_demand = Column(String(50), default="medium")
    category = Column(String(100), nullable=True)
    keywords = Column(ARRAY(String), default=[])
    resources = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('ix_careers_title', 'title'),
        Index('ix_careers_category', 'category'),
        Index('ix_careers_job_demand', 'job_demand'),
    )
    
    def __repr__(self):
        return f"<Career(id={self.id}, title={self.title}, category={self.category})>"


# =============================================================================
# USER CAREER PROGRESS MODEL
# =============================================================================
class UserCareer(Base):
    """
    User Career model - tracks user's career interests and progress
    """
    __tablename__ = "user_careers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    career_id = Column(UUID(as_uuid=True), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    current_skill_level = Column(JSONB, default={})
    completed_milestones = Column(ARRAY(String), default=[])
    interest_level = Column(String(20), default="interested")
    target_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('ix_user_careers_user_career', 'user_id', 'career_id', unique=True),
    )
    
    def __repr__(self):
        return f"<UserCareer(user_id={self.user_id}, career_id={self.career_id}, interest_level={self.interest_level})>"


# =============================================================================
# EXPORT ALL MODELS FOR EASY IMPORT
# =============================================================================
__all__ = [
    "Base",
    "User",
    "Course",
    "CourseEnrollment",
    "Career",
    "UserCareer",
]

