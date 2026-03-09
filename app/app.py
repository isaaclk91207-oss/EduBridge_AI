from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from contextlib import asynccontextmanager
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.getcwd())

# Import များကို 'backend.' မပါဘဲ 'app.' ပုံစံဖြင့် ပြင်ဆင်သည်
from app.core.db_utility import database_initialize
from app.Schemas.schemas import ChatRequest
from app.database.storage import get_all_lectures, get_all_candidates
from app.routes.v1.agent_route import router as issues_router
from app.routes.v1.authentication_route import router as authentication_router
from app.routes.v1.user import router as user_router



@asynccontextmanager
async def db_lifespan(app: FastAPI):
    # Try to initialize database, but continue even if it fails (for development without DB)
    try:
        await database_initialize()
    except Exception as e:
        print(f"Warning: Database initialization failed (expected if no DB configured): {e}")
    yield


app = FastAPI(title="EduBridge AI API", version="0.0.1" , lifespan=db_lifespan)


# CORS Setup - allows all origin including localhost:3000 for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(issues_router)
app.include_router(authentication_router)
app.include_router(user_router)


# Health Check Endpoint
@app.get("/")
async def root():
    return {"status": "ok", "message": "EduBridge AI API is running"}


# LECTURES API ENDPOINTS


@app.get("/api/lectures")
async def get_lectures():
    """Fetch all lectures from the database and return with embed URLs"""
    lectures = get_all_lectures()

    # Transform to include embed URL
    result = []
    for lecture in lectures:
        youtube_id = lecture.get('youtube_id', '')
        embed_url = f"https://www.youtube.com/embed/{youtube_id}" if youtube_id else ""

        result.append({
            "id": lecture.get('id'),
            "title": lecture.get('title'),
            "youtubeId": youtube_id,
            "embed_url": embed_url,
            "duration": lecture.get('duration'),
            "course": lecture.get('course')
        })

    return {"lectures": result}



# CANDIDATES API ENDPOINTS


@app.get("/api/candidates")
async def get_candidates():
    """Fetch all candidates from the database"""
    candidates = get_all_candidates()

    # Transform skills from string to array if needed
    result = []
    for candidate in candidates:
        skills = candidate.get('skills', '')
        # If skills is a string, split by comma
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(',') if s.strip()]

        result.append({
            "id": candidate.get('id'),
            "name": candidate.get('name'),
            "role": candidate.get('role'),
            "skills": skills,
            "match_score": candidate.get('match_score'),
            "experience": candidate.get('experience'),
            "summary": candidate.get('summary'),
            "location": candidate.get('location')
        })

    return {"candidates": result}



# CHAT API ENDPOINT


# Chat Response Schema
class ChatResponse(BaseModel):
    reply: str


# Simple AI Response Generator (Replace with your actual AI model)
def generate_ai_response(message: str, history: List[dict]) -> str:
    """Generate AI response based on user message"""
    message_lower = message.lower()

    # Greeting responses
    if any(word in message_lower for word in ["hello", "hi", "hey", "မင်္ဂလာပါ", "ဟယ်လို"]):
        return "Hello! I'm your AI learning assistant. How can I help you today? You can ask me about courses, assignments, career guidance, or any questions about your learning journey."

    # Course related
    elif any(word in message_lower for word in ["course", "class", "သင်တန်း", "ကောက်စာ"]):
        return "I can help you with courses! Check out the Courses section in your dashboard to browse available courses. You can enroll in courses that match your career goals."

    # Assignment related
    elif any(word in message_lower for word in ["assignment", "homework", "task", "အလုပ်", "ပါစီယာ"]):
        return "Looking for assignments? Visit the Assignments page to see your pending tasks. Make sure to submit them before the deadline!"

    # Career related
    elif any(word in message_lower for word in ["career", "job", "employment", "အလုပ်", "အသက်လမ်း"]):
        return "For career guidance, check out the Career page. We offer AI-powered career recommendations, job listings, and interview preparation tools."

    # Interview prep
    elif any(word in message_lower for word in ["interview", "အင်တာဗျူး", "အင်တာဗျူးပြင်ဆင်ခြင်း"]):
        return "Visit the AI Interview Practice page to prepare for interviews. You can practice with mock interviews and get AI-powered feedback on your responses."

    # Portfolio
    elif any(word in message_lower for word in ["portfolio", "project", "ပရိုဂျက်", "ပါဝါလီအိုက်"]):
        return "Build your portfolio in the AI Portfolio section. Showcase your projects and skills to potential employers."

    # Help
    elif any(word in message_lower for word in ["help", "help လုပ်ပါး", "ကူညီပါး"]):
        return "I'm here to help! You can ask me about:\n- Courses and enrollments\n- Assignments and deadlines\n- Career guidance\n- Interview preparation\n- Portfolio building\n- General questions about EduBridge AI"

    # Thank you
    elif any(word in message_lower for word in ["thanks", "thank you", "ကေးဇူးတင်ပါး", "ကျေးဇူးတင်ပါ"]):
        return "You're welcome! Feel free to ask if you have more questions. I'm always here to help!"

    # Default response
    else:
        return "I'm here to help! Try asking about courses, assignments, career guidance, interview preparation, or portfolio building. You can also ask me for general help!"


# AI Chat Endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """AI Chat endpoint for the support chatbot"""
    # Generate AI response
    ai_reply = generate_ai_response(request.message, request.history or [])

    return ChatResponse(reply=ai_reply)

    # main.py မှာ ထည့်ရမည့် AI Chat Route နမူနာ


@app.post("/api/ai-tutor")
async def ai_tutor(message: str, video_title: str):
    # ဒီနေရာမှာ Gemini ဒါမှမဟုတ် OpenAI API ကို ခေါ်ပြီး
    # Video Title နဲ့ သက်ဆိုင်တဲ့ ရှင်းလင်းချက်ကို ပြန်ပေးရမှာပါ
    response = f"You asked about {video_title}. Here is the explanation: {message}..."
    return {"reply": response}
