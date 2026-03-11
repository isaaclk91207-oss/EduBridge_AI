from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

# Import groq_client from storage
from database.storage import groq_client

router = APIRouter(prefix="/scan", tags=["Career Scanner"])


# Request schema for career scan
class CareerScanRequest(BaseModel):
    user_id: str
    skills: List[str]
    learning_history: List[dict]  # List of courses/lectures completed
    interests: List[str]
    experience_years: Optional[int] = 0
    education: Optional[str] = ""


@router.post("")
async def career_scan(request: CareerScanRequest):
    """
    Career Scanner - Analyze user's skills, learning history, and interests
    to generate a professional career report using Groq AI.
    """
    
    # Format learning history for AI
    formatted_history = []
    for item in request.learning_history:
        title = item.get('title', 'Unknown')
        course = item.get('course', '')
        duration = item.get('duration', '')
        formatted_history.append(f"- {title} ({course}) - {duration}")
    
    learning_text = "\n".join(formatted_history) if formatted_history else "No learning history recorded"
    skills_text = ", ".join(request.skills) if request.skills else "No skills listed"
    interests_text = ", ".join(request.interests) if request.interests else "No interests specified"
    
    # Build AI prompt for career analysis
    career_prompt = f"""You are an expert Career Analyst AI. Analyze the following user data and provide a comprehensive career report.

USER PROFILE:
- Skills: {skills_text}
- Learning History:
{learning_text}
- Interests: {interests_text}
- Years of Experience: {request.experience_years}
- Education: {request.education}

Please provide a JSON response with the following structure:
{{
    "recommended_careers": ["Career 1", "Career 2", "Career 3"],
    "skill_gaps": ["Skill 1", "Skill 2"],
    "learning_path": ["Course 1", "Course 2", "Course 3"],
    "professional_summary": "A 2-3 sentence professional summary",
    "market_demand": "High/Medium/Low",
    "salary_range": "$X - $Y per year"
}}

Respond ONLY in JSON format."""

    try:
        if groq_client is None:
            return {
                "error": "AI service is not available",
                "message": "Please check API configuration. GROQ_API_KEY may be missing."
            }
        
        # Call Groq API
        response = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful career advisor AI."},
                {"role": "user", "content": career_prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        ai_response = response.choices[0].message.content
        
        # Parse JSON from response
        import json
        import re
        
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\{[\s\S]*\}', ai_response)
            if json_match:
                career_report = json.loads(json_match.group())
            else:
                # If no JSON found, create a structured response
                career_report = {
                    "recommended_careers": ["Software Developer", "Data Analyst", "Product Manager"],
                    "skill_gaps": ["Communication", "Leadership"],
                    "learning_path": ["Advanced Python", "System Design", "Business Fundamentals"],
                    "professional_summary": ai_response[:200] if ai_response else "Unable to generate summary.",
                    "market_demand": "Medium",
                    "salary_range": "$60,000 - $120,000"
                }
        except json.JSONDecodeError:
            career_report = {
                "recommended_careers": ["Software Developer", "Data Analyst"],
                "skill_gaps": ["Communication"],
                "learning_path": ["Advanced Python", "System Design"],
                "professional_summary": "Tech professional with skills in " + skills_text,
                "market_demand": "Medium",
                "salary_range": "$60,000 - $120,000"
            }
        
        return {
            "success": True,
            "user_id": request.user_id,
            "report": career_report
        }
        
    except Exception as e:
        print(f"Career Scan Error: {e}")
        return {
            "error": "Career scan failed",
            "message": str(e)
        }

