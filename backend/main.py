"""
EduBridge AI Backend - Main Application Entry Point
This is the main FastAPI application file.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.database import database_initialize
from routes import authentication, users, lectures, candidates


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    try:
        await database_initialize()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
    yield


# Create FastAPI app
app = FastAPI(
    title="EduBridge AI API",
    version="1.0.0",
    description="Backend API for EduBridge AI Learning Platform",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://edu-bridge-ai-frontend.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(authentication.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(lectures.router, prefix="/api/lectures", tags=["Lectures"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])


# Health Check Endpoint
@app.get("/")
async def root():
    return {"status": "ok", "message": "EduBridge AI API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

