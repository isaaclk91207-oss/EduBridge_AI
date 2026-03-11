"""
Lecture Model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from core.database import Base


class Lecture(Base):
    """Lecture model for video courses."""
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    youtube_id = Column(String(50), nullable=True)
    video_url = Column(String(500), nullable=True)
    duration = Column(String(50), nullable=True)  # e.g., "10:30"
    course = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Lecture(title={self.title}, course={self.course})>"

