# EduBridge AI - Repository Consolidation Plan

## Overview
This document outlines the plan to consolidate your repositories and clean up the project structure.

---

## Current Situation

### Repository 1: EduBridge_AI (Main)
- **Status**: Active/Production
- **Purpose**: Full-stack monorepo with Next.js frontend + FastAPI backend
- **Deploy**: Vercel (root `app/` folder)
- **Contains**: 
  - `app/` - Next.js + FastAPI (monorepo)
  - Frontend: Next.js pages, components
  - Backend: API routes in `app/api/`, models in `app/models/`, services in `app/services/`

### Repository 2: EduBridge-AI_Backend (Legacy)
- **Status**: Inactive/Archived
- **Purpose**: Was a separate backend repo before monorepo transition
- **Contains**: Duplicate backend code (now redundant)

---

## Decision

**Keep**: `EduBridge_AI` as the main repository  
**Archive**: `EduBridge-AI_Backend` (no longer needed)

---

## Step-by-Step Consolidation Plan

### Step 1: Remove Redundant `backend/` Folder

The `backend/` folder in your local project is a duplicate of the separate repo. Remove it:

```bash
# From your project root
rm -rf backend/
```

Or delete it in your code editor/IDE.

### Step 2: Verify Root `app/` Structure

Your active `app/` folder should have this structure:

```
app/
├── api/                    # API Routes (FastAPI endpoints)
│   ├── auth/
│   ├── user/
│   ├── progress/
│   └── ...
├── core/                   # Core configurations
│   ├── config.py           # Settings
│   ├── db_utility.py      # Database utilities
│   └── supabase_initialize.py
├── models/                 # SQLAlchemy models
│   └── psql_model.py      # User, Course, Career models
├── services/               # Business logic
│   ├── authentication_service.py
│   ├── password_hashing.py
│   └── jwt_service.py
├── routes/                 # Additional routes
├── app.py                  # FastAPI app
├── main.py                 # Entry point
└── ...
```

### Step 3: Verify Dependencies

Ensure your `requirements.txt` (root) has all needed packages:

```
fastapi==0.129.0
uvicorn==0.40.0
python-dotenv==1.2.1
psycopg2-binary==2.9.9
asyncpg==0.30.0
sqlalchemy[asyncio]==2.0.28
pydantic==2.12.5
pydantic-settings==2.13.0
supabase==2.28.0
httpx==0.28.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.22
openai==2.21.0
google-genai==1.63.0
google-api-python-client==2.93.0
```

### Step 4: Verify Vercel Configuration

Your `vercel.json` should look like this:

```json
{
  "buildCommand": "pip install -r requirements.txt",
  "installCommand": "pip install -r requirements.txt",
  "framework": null,
  "outputDirectory": ".",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/app/$1"
    }
  ]
}
```

### Step 5: Environment Variables

Make sure these are set in Vercel:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXT_PUBLIC_API_URL` - Your Vercel backend URL
- `SECRET_KEY` - JWT secret (min 32 characters)
- `SUPABASE_URL` - Supabase project URL (if using)
- `SUPABASE_KEY` - Supabase anon key (if using)

---

## Files to Keep (Root)

```
✅ app/                    # Main application
✅ requirements.txt        # Python dependencies
✅ package.json            # Node dependencies
✅ next.config.ts          # Next.js config
✅ vercel.json             # Vercel config
✅ tsconfig.json            # TypeScript config
✅ .env.example            # Environment template
✅ *.sql                   # Database schemas
✅ *.md                    # Documentation
```

## Files to Remove

```
❌ backend/                # Legacy folder - DELETE
```

---

## Post-Consolidation Checklist

- [ ] Delete `backend/` folder locally and from GitHub
- [ ] Push changes to `EduBridge_AI` repository
- [ ] Trigger new deployment on Vercel
- [ ] Test signup/login to confirm everything works
- [ ] Archive `EduBridge-AI_Backend` repo on GitHub

---

## GitHub Actions (Optional)

If you want to delete the old repo after archiving:

1. Go to GitHub → Settings → Danger Zone → Delete this repository
2. Or simply mark it as archived (read-only)

---

## Summary

| Item | Action |
|------|--------|
| Main Repo | `EduBridge_AI` ✅ |
| Legacy Repo | Archive/Delete `EduBridge-AI_Backend` |
| Local `backend/` folder | DELETE |
| Vercel deploy source | Root `app/` folder |
| Database | Neon PostgreSQL |

After completing these steps, your project will be clean and properly consolidated!

