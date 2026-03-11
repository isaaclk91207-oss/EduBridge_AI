"""
Candidates Routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List

from core.database import get_async_session

router = APIRouter()


class CandidateResponse(BaseModel):
    id: int
    name: str
    email: str | None = None
    role: str | None = None
    skills: List[str] = []
    experience: str | None = None
    location: str | None = None
    match_score: int | None = None
    summary: str | None = None

    class Config:
        from_attributes = True


# Mock data for demonstration
MOCK_CANDIDATES = [
    {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "Software Engineer",
        "skills": ["Python", "JavaScript", "React"],
        "experience": "3 years",
        "location": "New York",
        "match_score": 85,
        "summary": "Experienced developer"
    },
    {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "Data Scientist",
        "skills": ["Python", "Machine Learning", "SQL"],
        "experience": "5 years",
        "location": "San Francisco",
        "match_score": 92,
        "summary": "AI/ML specialist"
    }
]


@router.get("/", response_model=List[CandidateResponse])
async def get_candidates(session: AsyncSession = Depends(get_async_session)):
    """Get all candidates."""
    candidates = []
    for candidate in MOCK_CANDIDATES:
        skills = candidate.get("skills", [])
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",")]
        
        candidates.append(CandidateResponse(
            id=candidate["id"],
            name=candidate["name"],
            email=candidate.get("email"),
            role=candidate.get("role"),
            skills=skills,
            experience=candidate.get("experience"),
            location=candidate.get("location"),
            match_score=candidate.get("match_score"),
            summary=candidate.get("summary")
        ))
    
    return candidates


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(candidate_id: int, session: AsyncSession = Depends(get_async_session)):
    """Get a specific candidate."""
    for candidate in MOCK_CANDIDATES:
        if candidate["id"] == candidate_id:
            skills = candidate.get("skills", [])
            if isinstance(skills, str):
                skills = [s.strip() for s in skills.split(",")]
            
            return CandidateResponse(
                id=candidate["id"],
                name=candidate["name"],
                email=candidate.get("email"),
                role=candidate.get("role"),
                skills=skills,
                experience=candidate.get("experience"),
                location=candidate.get("location"),
                match_score=candidate.get("match_score"),
                summary=candidate.get("summary")
            )
    
    return {"error": "Candidate not found"}

