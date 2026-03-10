# 🎓 EduBridge AI - Smart Learning Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python" alt="Python">
</p>

EduBridge AI is an intelligent educational platform that combines AI technology with modern web development to create personalized learning experiences, career guidance, and interview preparation for students and professionals.

---

## 📚 Table of Contents

- [What is EduBridge AI?](#what-is-edubridge-ai)
- [Key Features Explained](#key-features-explained)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Detailed Component Guide](#detailed-component-guide)
- [Getting Started](#getting-started)
- [How Authentication Works](#how-authentication-works)
- [AI Agents Explained](#ai-agents-explained)
- [API Endpoints Reference](#api-endpoints-reference)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🤔 What is EduBridge AI?

EduBridge AI is a full-stack educational platform that helps students and professionals:

1. **Learn Effectively** - Get personalized AI-generated learning roadmaps based on your goals
2. **Prepare for Careers** - Practice interviews with AI mentors and get real-time feedback
3. **Build Portfolios** - Create professional portfolios showcase your skills
4. **Track Progress** - Monitor your learning journey with visual dashboards
5. **Connect with Employers** - Get matched with job opportunities based on your skills

### Why This Architecture?

We use a **client-server architecture** with:
- **Next.js Frontend** - Modern React framework for building the user interface
- **FastAPI Backend** - Python web framework for handling business logic and AI integration
- **JWT Authentication** - Secure stateless authentication using HTTP-only cookies

This separation allows us to:
- Use AI APIs efficiently on the backend
- Keep API keys secure (never exposed to client)
- Scale each part independently
- Use the best tools for each job

---

## ✨ Key Features Explained

### 1. 🤖 AI-Powered Agents

**What it does:**
Three specialized AI assistants help you at different stages of your learning and career journey.

- **Co-Founder Agent** - Acts as a startup advisor, helps create learning roadmaps and career strategies
- **Mentor Agent** - Practices interviews with you, provides feedback on your answers
- **Support Agent** - Answers questions about the platform, helps with technical issues

**How it works:**
Each agent uses different AI models optimized for their specific task:
```
Co-Founder → Gemini 2.0 Flash (fast, comprehensive)
Mentor → DeepSeek V3 (streaming responses for conversation)
Support → Llama 3.1 8B (quick, reliable answers)
```

### 2. 🗺️ AI Roadmaps

**What it does:**
Generates personalized learning paths based on your career goals, current skills, and available time.

**How it works:**
1. You input your goal (e.g., "Become a software developer")
2. AI analyzes what skills are needed
3. Creates a step-by-step roadmap with courses and resources
4. Tracks your progress as you complete each step

### 3. 🎤 AI Interview Practice

**What it does:**
Simulates real interview scenarios with AI-powered mock interviews.

**How it works:**
1. Choose your target job/industry
2. AI asks relevant interview questions
3. You record your answers (voice/text)
4. AI provides feedback on:
   - Content quality
   - Communication style
   - Areas for improvement

### 4. 📁 AI Portfolio Builder

**What it does:**
Helps create professional portfolios that showcase your skills and projects.

**How it works:**
1. Input your projects, skills, and experience
2. AI suggests improvements and layouts
3. Generates a polished portfolio website
4. Export as PDF or share online

### 5. 📚 Course Management

**What it does:**
Browse, enroll, and track progress in various courses.

**Features:**
- Course catalog with search/filter
- Enrollment system
- Progress tracking
- Completion certificates

### 6. 💼 Career Guidance

**What it does:**
AI-powered career recommendations based on your skills, interests, and market trends.

**Includes:**
- Job recommendations
- Salary insights
- Skill gap analysis
- Industry trends

### 7. 🔐 Secure Authentication

**What it does:**
Keeps your account secure with industry-standard security practices.

**Security Features:**
- JWT tokens (stateless, scalable)
- HTTP-only cookies (XSS protection)
- Password hashing with bcrypt
- Role-based access (student/employer)

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
                                    ┌─────────────────────────────────────┐
                                    │         User's Browser              │
                                    │   (Next.js React Application)       │
                                    │                                      │
                                    │  ┌─────────┐  ┌──────────────┐     │
                                    │  │ Frontend│  │  API Routes  │     │
                                    │  │   Pages │  │ (/api/*)     │     │
                                    │  └────┬────┘  └──────┬───────┘     │
                                    │       │              │             │
                                    └───────┼──────────────┼─────────────┘
                                            │              │
                                            ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Internet / Network                               │
└─────────────────────────────────────────────────────────────────────────┘
                                            │
                                  (Optional Proxy)
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Backend Server (FastAPI)                             │
│                        http://localhost:8000                            │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   AI APIs   │  │  Database   │  │  Services   │  │  Middleware │    │
│  │  (Gemini,   │  │ (PostgreSQL/│  │  (Auth,     │  │  (Logging,  │    │
│  │   Groq,     │  │   SQLite)   │  │   JWT)      │  │   Timing)   │    │
│  │   DeepSeek) │  │             │  │             │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### How Data Flows

```
User Action → Frontend Page → API Route → Backend Service → Database/AI
    │              │              │             │              │
    │              │              │             │              │
    ▼              ▼              ▼             ▼              ▼
  Click/Submit → React State → HTTP Request → Business Logic → SQL/AI API
                                                        │
                                                        ▼
                                                 Response Data
                                                        │
                                                        ▼
                                                 Frontend Update
```

### Frontend-Backend Communication

**Scenario: User logs in**

```
1. User fills login form (email/password)
         │
         ▼
2. Frontend calls: POST /api/auth/login
         │
         ▼
3. Next.js API route validates input
         │
. For         ▼
4wards to FastAPI: POST localhost:8000/authentication/login
         │
         ▼
5. FastAPI validates credentials, generates JWT
         │
         ▼
6. Returns token to Next.js
         │
         ▼
7. Next.js sets HTTP-only cookie
         │
         ▼
8. Redirects to /dashboard
```

---

## 💻 Technology Stack

### Frontend Technologies

| Technology | Purpose | Why It Matters |
|------------|---------|----------------|
| **Next.js 14** | React Framework | Server-side rendering, SEO, file-based routing |
| **TypeScript** | Type Safety | Catches errors before runtime, better IDE support |
| **Tailwind CSS** | Styling | Rapid UI development, consistent design system |
| **React Context** | State Management | Share data across components without prop drilling |
| **Framer Motion** | Animations | Smooth, professional animations |
| **Lucide React** | Icons | Clean, consistent icon set |

### Backend Technologies

| Technology | Purpose | Why It Matters |
|------------|---------|----------------|
| **FastAPI** | Web Framework | Fast, automatic docs, async support |
| **Python 3.10+** | Language | Great AI library support |
| **SQLAlchemy** | ORM | Database abstraction, type safety |
| **JWT (python-jose)** | Authentication | Stateless, secure token management |
| **bcrypt** | Password Hashing | Industry-standard security |
| **Uvicorn** | ASGI Server | High-performance async server |

### AI & External Services

| Service | Purpose |
|---------|---------|
| **Google Gemini** | AI co-founder agent |
| **Groq** | Fast AI inference |
| **DeepSeek** | Streaming chat responses |
| **Supabase** | Optional cloud database |

---

## 📂 Project Structure

### Root Level

```
edubridge-ai/
├── app/                    # Next.js 14 App Router (Frontend)
├── components/            # React UI Components
├── lib/                   # Utility libraries & hooks
├── public/                # Static assets (images, icons)
├── backend/               # FastAPI Backend (Python)
├── package.json           # Frontend dependencies
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── middleware.ts          # Next.js middleware (auth)
```

---

## 📖 Detailed Component Guide

### 1. Frontend: `app/` Directory

The `app/` directory uses **Next.js 14 App Router**, which organizes pages as files instead of folders.

#### Key Files Explained

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout - wraps all pages, includes providers |
| `app/page.tsx` | Landing page - first page users see |
| `app/globals.css` | Global styles, Tailwind imports |

#### API Routes: `app/api/`

API routes act as a **proxy** between the frontend and backend. They keep API keys secure.

```
app/api/
├── auth/
│   ├── login/route.ts     # POST /api/auth/login
│   ├── logout/route.ts    # POST /api/auth/logout
│   └── signup/route.ts    # POST /api/auth/signup
├── user/
│   ├── profile/route.ts  # GET/PUT user profile
│   └── store.ts          # User state management
├── generate-roadmap/
│   └── route.ts          # POST AI roadmap generation
├── analyze-candidate/
│   └── route.ts          # POST AI candidate analysis
└── progress/
    └── update/route.ts   # PUT learning progress
```

**Example: How login route works**

```typescript
// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Call FastAPI backend
  const response = await fetch('http://localhost:8000/authentication/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  
  // Set HTTP-only cookie
  const nextResponse = NextResponse.json(data);
  nextResponse.cookies.set('access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  
  return nextResponse;
}
```

#### Dashboard Pages: `app/dashboard/`

Protected pages that require authentication.

```
app/dashboard/
├── layout.tsx             # Dashboard layout with sidebar/header
├── page.tsx               # Main dashboard (redirects if not logged in)
├── settings/              # User settings
├── career/                # Job listings & recommendations
├── courses/               # Course catalog
│   └── [courseId]/        # Dynamic route for individual courses
├── assignments/           # Homework/assignments
├── ai-roadmap/            # AI learning roadmap generator
├── ai-interview/          # AI interview practice
├── ai-portfolio/          # AI portfolio builder
├── ai-path/               # AI learning path
├── visual-roadmap/        # Visual progress display
├── practice/              # Practice exercises
├── messages/              # Messaging system
└── employer/              # Employer dashboard
```

**Example: Protected Page Structure**

```typescript
// app/dashboard/page.tsx
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Check authentication (done in middleware)
  // If not authenticated, middleware redirects to /signin
  
  return (
    <div className="p-6">
      <h1>Welcome to your Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### 2. Components: `components/`

Reusable React components organized by feature.

```
components/
├── dashboard/            # Dashboard-specific components
│   ├── Sidebar.tsx       # Navigation menu
│   ├── Header.tsx        # Top bar with user info
│   ├── AIRoadmap.tsx     # AI roadmap display
│   ├── AIInterview.tsx   # Interview practice UI
│   ├── AIPortfolio.tsx   # Portfolio builder
│   ├── DynamicRoadmap.tsx      # Interactive roadmap
│   ├── VisualAIRoadmap.tsx     # Visual progress
│   ├── EmployeeDashboard.tsx   # Employer view
│   ├── EmployerStudentChat.tsx # Chat between employer/student
│   ├── CourseProgressDashboard.tsx  # Progress tracking
│   ├── RealTimeDashboard.tsx        # Live updates
│   └── AISupportChat.tsx    # AI chat widget
├── ThemeContext.tsx      # Dark/light mode
├── Providers.tsx         # React context providers
├── AIInterviewPrep.tsx   # Interview preparation
├── BusinessSimulation.tsx # Business case practice
├── RecommendedJobs.tsx   # Job recommendations
└── ResumePreview.tsx     # Resume display
```

**Example: Component Usage**

```typescript
// Using a component in a page
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

### 3. Utilities: `lib/`

Helper functions and client configurations.

```
lib/
├── auth.tsx                   # Authentication context
│   ├── useAuth() hook         # Check if user is logged in
│   ├── AuthProvider           # Wraps app for auth state
│   ├── login()                # Login function
│   ├── logout()               # Logout function
│   └── getProfile()           # Get user profile
├── supabase.ts                # Supabase client (optional)
├── useUser.ts                 # User data hook
├── useCourseProgress.ts       # Progress tracking hook
├── useCareerIntelligence.ts   # AI career advice hook
├── useAssignmentNotifications.ts  # Assignment alerts
├── cv-generator.ts            # Resume/portfolio PDF generator
└── telegram-discord.ts        # External integrations
```

**Example: Using Auth Hook**

```typescript
// Using auth in a component
import { useAuth } from '@/lib/auth';

function ProfileButton() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <a href="/signin">Sign In</a>;
  }
  
  return (
    <div>
      <span>Welcome, {user.email}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 4. Backend: `backend/`

FastAPI application handling business logic and AI integration.

```
backend/
├── main.py                  # Entry point, starts server
├── init_db.py              # Database initialization
├── requirements.txt        # Python dependencies
├── app/
│   ├── app.py             # FastAPI app configuration
│   ├── schemas.py         # Pydantic models (request/response)
│   ├── storage.py         # Storage utilities
│   ├── core/              # Core configurations
│   │   ├── config.py      # Environment variables
│   │   ├── db_utility.py  # Database session management
│   │   └── supabase_initialize.py  # DB connection
│   ├── database/
│   │   └── storage.py     # Database operations
│   ├── models/
│   │   └── psql_model.py  # SQLAlchemy ORM models
│   ├── routes/            # API endpoints
│   │   ├── issues.py      # AI agent endpoints
│   │   └── v1/            # Versioned API
│   │       ├── agent_route.py
│   │       ├── authentication_route.py
│   │       └── user.py
│   ├── services/         # Business logic
│   │   ├── authentication_service.py
│   │   ├── jwt_service.py
│   │   └── password_hashing.py
│   └── middleware/
│       └── timer.py       # Request timing
└── migration/             # Database migrations
```

#### Backend Services Explained

**Authentication Service**

```python
# backend/app/services/authentication_service.py
from passlib.context import CryptContext
import jwt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def verify_password(self, plain_password, hashed_password):
        """Verify password matches hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password):
        """Hash a password for storage"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data):
        """Create JWT token"""
        return jwt.encode(data, settings.SECRET_KEY, algorithm="HS256")
```

**JWT Service**

```python
# backend/app/services/jwt_service.py
from jose import JWTError, jwt
from datetime import datetime, timedelta

class JWTService:
    def create_token(self, user_id: str, email: str) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(days=7)
        to_encode = {
            "sub": user_id,
            "email": email,
            "exp": expire
        }
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    
    def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except JWTError:
            return None
```

---

## 🚀 Getting Started

### Prerequisites Checklist

Before you begin, make sure you have:

| Requirement | Version | How to Check |
|-------------|---------|--------------|
| Node.js | 18+ | `node --version` |
| Python | 3.10+ | `python --version` |
| npm | 9+ | `npm --version` |

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd edubridge-ai

# Install frontend dependencies
npm install
```

### Step 2: Environment Setup

Create a `.env.local` file in the root directory:

```env
# Optional: For cloud database (recommended for production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: For AI features (get from Google AI Studio, Groq, etc.)
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
SILICONFLOW_API_KEY=your-sf-key
YOUTUBE_API_KEY=your-youtube-key
```

### Step 3: Run the Application

#### Option A: Frontend Only (Most Common)

```bash
# Start the development server
npm run dev
```

The app will be available at: **http://localhost:3000**

#### Option B: Full Stack (Frontend + Backend)

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend

# Create virtual environment (first time only)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run backend
python main.py
# Or with uvicorn
uvicorn main:app --reload --port 8000
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🔐 How Authentication Works

### The Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                        │
└─────────────────────────────────────────────────────────────┘

1. User visits /dashboard
          │
          ▼
2. Next.js Middleware checks for access_token cookie
          │
          ├── No cookie ──→ Redirect to /signin
          │
          └── Has cookie ──→ Validate with backend
                    │
                    ├── Invalid/Expired ──→ Redirect to /signin
                    │
                    └── Valid ──→ Show dashboard
```

### Security Features

| Feature | Implementation | Why It Matters |
|---------|---------------|----------------|
| **HTTP Only Cookies** | `httpOnly: true` | JavaScript cannot read the cookie (prevents XSS) |
| **Secure Cookies** | `secure: true` | Only sent over HTTPS in production |
| **SameSite** | `sameSite: 'lax'` | Prevents CSRF attacks |
| **Short Expiry** | 7 days max | Limits damage if token is stolen |
| **Password Hashing** | bcrypt | Even if DB is compromised, passwords are safe |

### Code Example: Login

```typescript
// Frontend: lib/auth.tsx (simplified)
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  // Cookie is set by the API route
  return response.json();
}
```

### Code Example: Protected API Call

```typescript
// Frontend: Making authenticated API call
async function getUserProfile() {
  const response = await fetch('/api/user/profile', {
    headers: {
      // Cookie is automatically included
    },
  });
  
  if (response.status === 401) {
    // Token expired or invalid
    window.location.href = '/signin';
    return null;
  }
  
  return response.json();
}
```

---

## 🤖 AI Agents Explained

### Three Specialized AI Assistants

| Agent | Purpose | AI Model | Best For |
|-------|---------|----------|----------|
| **Co-Founder** | Startup advice, career planning | Gemini 2.0 Flash | Strategic questions |
| **Mentor** | Interview practice | DeepSeek V3 | Conversation practice |
| **Support** | General help | Llama 3.1 8B | Quick answers |

### API Endpoints

```
POST /chat/cofounder    # Startup advisor
POST /chat/mentor       # Interview practice  
POST /chat/support      # General support
```

### Example Request

```bash
curl -X POST http://localhost:8000/chat/cofounder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "I want to become a data scientist. What should I learn?",
    "history": []
  }'
```

### Response

```json
{
  "response": "To become a data scientist, I'd recommend...",
  "sources": ["course-1", "resource-2"]
}
```

---

## 📡 API Endpoints Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/logout` | User logout |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |

### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-roadmap` | Generate learning roadmap |
| POST | `/api/analyze-candidate` | Analyze job candidate |

### Backend API (FastAPI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/authentication/login` | Backend login |
| POST | `/authentication/register` | Backend register |
| POST | `/chat/cofounder` | AI co-founder chat |
| POST | `/chat/mentor` | AI mentor chat |
| POST | `/chat/support` | AI support chat |

---

## 🗄️ Database Schema

### Main Tables

**Users Table**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Courses Table**
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    duration VARCHAR(50),
    level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Enrollments Table**
```sql
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Environment Variables

### Required Variables

None required for basic local development. The app works with defaults.

### Optional Variables

```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Services
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
SILICONFLOW_API_KEY=your-sf-key
YOUTUBE_API_KEY=your-youtube-api-key

# Security
SECRET_KEY=your-secret-key-change-in-production
```

---

## 🔧 Common Tasks

### Adding a New Page

1. Create a new folder in `app/dashboard/`
2. Add `page.tsx` file
3. Add layout elements (sidebar/header are automatic)

```typescript
// app/dashboard/new-feature/page.tsx
export default function NewFeaturePage() {
  return (
    <div>
      <h1>New Feature</h1>
      <p>Your feature content here</p>
    </div>
  );
}
```

### Adding a New API Route

1. Create folder in `app/api/`
2. Add `route.ts` file

```typescript
// app/api/new-endpoint/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Process request
  const result = { success: true, data: body };
  
  return NextResponse.json(result);
}
```

### Adding a New Backend Route

1. Create file in `backend/app/routes/`
2. Add endpoint function

```python
# backend/app/routes/new_route.py
from fastapi import APIRouter

router = APIRouter()

@router.post("/new-endpoint")
async def new_endpoint(data: dict):
    return {"success": True, "data": data}
```

### Adding a New Component

1. Create file in `components/dashboard/`
2. Use in pages

```typescript
// components/dashboard/NewComponent.tsx
interface Props {
  title: string;
}

export default function NewComponent({ title }: Props) {
  return (
    <div className="p-4 border rounded">
      <h2>{title}</h2>
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Module not found" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. "Port already in use"

```bash
# Find and kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

#### 3. Backend connection errors

```bash
# Make sure backend is running
# Check http://localhost:8000/docs
```

#### 4. Authentication not working

1. Check browser cookies are enabled
2. Clear application cookies
3. Try incognito mode
4. Check console for errors

#### 5. AI features not working

1. Verify API keys in `.env.local`
2. Check backend logs
3. Verify internet connection

---

## 🤝 Contributing

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** your changes
5. **Submit** a pull request

### Code Standards

- Use TypeScript for new code
- Follow existing code style
- Add comments for complex logic
- Write meaningful commit messages

### Adding Features

| Type | Location |
|------|----------|
| New page | `app/dashboard/feature/page.tsx` |
| New API route | `app/api/feature/route.ts` |
| New component | `components/dashboard/Feature.tsx` |
| New backend route | `backend/app/routes/feature.py` |

---

## 📄 License

MIT License - Feel free to use this project for:

- Personal learning
- Commercial projects
- Educational purposes

---

## 👥 Team & Credits

Built with ❤️ using:

- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google Gemini](https://ai.google.dev/) - AI assistance
- [Groq](https://groq.com/) - AI inference

---

## 📞 Support

- Open an issue on GitHub
- Check existing issues
- Read the documentation

---

Happy Coding! 🚀

If you find this helpful, please ⭐ the repository!
