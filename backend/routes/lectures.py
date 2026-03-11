"""
Lectures Routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List

from core.database import get_async_session

router = APIRouter()


class LectureResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    youtube_id: str | None = None
    embed_url: str | None = None
    duration: str | None = None
    course: str | None = None
    category: str | None = None

    class Config:
        from_attributes = True


# Mock data for demonstration
MOCK_LECTURES = [
    {
        "id": 1,
        "title": "Introduction to Python",
        "description": "Learn Python basics",
        "youtube_id": "dQw4w9WgXcQ",
        "duration": "10:30",
        "course": "Python 101",
        "category": "programming"
    },
    {
        "id": 2,
        "title": "Web Development Fundamentals",
        "description": "HTML, CSS, and JavaScript basics",
        "youtube_id": "UB1O30fR-EE",
        "duration": "45:00",
        "course": "Web Dev",
        "category": "web"
    }
]


@router.get("/", response_model=List[LectureResponse])
async def get_lectures(session: AsyncSession = Depends(get_async_session)):
    """Get all lectures."""
    lectures = []
    for lecture in MOCK_LECTURES:
        youtube_id = lecture.get("youtube_id", "")
        embed_url = f"https://www.youtube.com/embed/{youtube_id}" if youtube_id else ""
        
        lectures.append(LectureResponse(
            id=lecture["id"],
            title=lecture["title"],
            description=lecture.get("description"),
            youtube_id=youtube_id,
            embed_url=embed_url,
            duration=lecture.get("duration"),
            course=lecture.get("course"),
            category=lecture.get("category")
        ))
    
    return lectures


@router.get("/{lecture_id}", response_model=LectureResponse)
async def get_lecture(lecture_id: int, session: AsyncSession = Depends(get_async_session)):
    """Get a specific lecture."""
    for lecture in MOCK_LECTURES:
        if lecture["id"] == lecture_id:
            youtube_id = lecture.get("youtube_id", "")
            embed_url = f"https://www.youtube.com/embed/{youtube_id}" if youtube_id else ""
            
            return LectureResponse(
                id=lecture["id"],
                title=lecture["title"],
                description=lecture.get("description"),
                youtube_id=youtube_id,
                embed_url=embed_url,
                duration=lecture.get("duration"),
                course=lecture.get("course"),
                category=lecture.get("category")
            )
    
    return {"error": "Lecture not found"}

