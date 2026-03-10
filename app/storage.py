# Load environment variables FIRST
from dotenv import load_dotenv
load_dotenv()

import os
from google import genai
from openai import AsyncOpenAI
from googleapiclient.discovery import build
from supabase import create_client, Client 

# Check for required API keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("⚠️ Warning: GEMINI_API_KEY is not set!")

# Gemini Setup - only initialize if API key exists
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY, http_options={'api_version': 'v1alpha'})
else:
    gemini_client = None

# SiliconFlow & Groq Setup (OpenAI SDK)
SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if SILICONFLOW_API_KEY:
    sf_client = AsyncOpenAI(
        api_key=SILICONFLOW_API_KEY, 
        base_url="https://api.siliconflow.com/v1"
    )
else:
    sf_client = None

if GROQ_API_KEY:
    groq_client = AsyncOpenAI(
        api_key=GROQ_API_KEY, 
        base_url="https://api.groq.com/openai/v1"
    )
else:
    groq_client = None

# OpenAI client not needed - using SiliconFlow and Groq instead
openai_client = None

# YouTube API Setup
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
youtube_service = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

def get_youtube_videos(query: str):
    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        request = youtube.search().list(
            q=query, part='snippet', 
            type='video', maxResults=3
        )
        response = request.execute()
        return [{"title": v['snippet']['title'], "link": f"https://youtu.be/{v['id']['videoId']}"} for v in response['items']]
    except:
        return []
    
# --- Database Setup (Supabase) ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize supabase as None by default
supabase = None

if not SUPABASE_URL or not SUPABASE_KEY:
    print("⚠️ Warning: Supabase credentials are missing!")
else:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Chat save function
def save_chat_to_db(user_id: str, role: str, message: str, agent_type: str):
    try:
        if supabase:
            supabase.table("chat_history").insert({
                "user_id": user_id,
                "role": role,
                "message": message,
                "agent_type": agent_type
            }).execute()
    except Exception as e:
        print(f"Error saving to DB: {e}")

# Get chat history for a user
def get_chat_history(user_id: str, limit: int = 50):
    try:
        if supabase:
            response = supabase.table("chat_history").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return response.data or []
    except Exception as e:
        print(f"Error fetching chat history: {e}")
    return []

# Save portfolio to student_portfolios table
def save_portfolio(user_id: str, career_role: str, skills: str, summary: str):
    try:
        if supabase:
            # Check if portfolio exists for this user
            existing = supabase.table("student_portfolios").select("*").eq("user_id", user_id).execute()
            
            if existing.data and len(existing.data) > 0:
                # Update existing portfolio
                supabase.table("student_portfolios").update({
                    "career_role": career_role,
                    "skills": skills,
                    "summary": summary
                }).eq("user_id", user_id).execute()
            else:
                # Insert new portfolio
                supabase.table("student_portfolios").insert({
                    "user_id": user_id,
                    "career_role": career_role,
                    "skills": skills,
                    "summary": summary
                }).execute()
            return True
    except Exception as e:
        print(f"Error saving portfolio: {e}")
    return False

# Get portfolio for a user
def get_portfolio(user_id: str):
    try:
        if supabase:
            response = supabase.table("student_portfolios").select("*").eq("user_id", user_id).execute()
            return response.data or []
    except Exception as e:
        print(f"Error fetching portfolio: {e}")
    return []

# ========================
# LECTURES DATABASE FUNCTIONS
# ========================

def get_all_lectures():
    """Fetch all lectures from the database"""
    try:
        if supabase:
            response = supabase.table("lectures").select("*").order("id").execute()
            return response.data or []
    except Exception as e:
        print(f"Error fetching lectures: {e}")
    return []

def get_lecture_by_id(lecture_id: int):
    """Fetch a single lecture by ID"""
    try:
        if supabase:
            response = supabase.table("lectures").select("*").eq("id", lecture_id).execute()
            if response.data:
                return response.data[0]
    except Exception as e:
        print(f"Error fetching lecture: {e}")
    return None

# ========================
# CANDIDATES DATABASE FUNCTIONS
# ========================

def get_all_candidates():
    """Fetch all candidates from the database"""
    try:
        if supabase:
            response = supabase.table("candidates").select("*").order("match_score", desc=True).execute()
            return response.data or []
    except Exception as e:
        print(f"Error fetching candidates: {e}")
    return []

def get_candidate_by_id(candidate_id: int):
    """Fetch a single candidate by ID"""
    try:
        if supabase:
            response = supabase.table("candidates").select("*").eq("id", candidate_id).execute()
            if response.data:
                return response.data[0]
    except Exception as e:
        print(f"Error fetching candidate: {e}")
    return None
