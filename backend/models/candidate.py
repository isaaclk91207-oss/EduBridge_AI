"""
Candidate Model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from core.database import Base


class Candidate(Base):
    """Candidate model for job candidates."""
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    role = Column(String(100), nullable=True)
    skills = Column(Text, nullable=True)  # Comma-separated skills
    experience = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    match_score = Column(Integer, nullable=True)
    summary = Column(Text, nullable=True)
    resume_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Candidate(name={self.name}, role={self.role})>"

