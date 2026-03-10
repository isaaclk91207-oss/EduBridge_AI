# Vercel Deployment Guide - EduBridge AI

## Architecture Overview

Your project uses a **dual-deployment** architecture:
- **Frontend**: Next.js 16 App Router (deployed to Vercel)
- **Backend**: FastAPI (deployed separately to Vercel)

The frontend's API routes (`app/api/*/route.ts`) proxy requests to the FastAPI backend via `NEXT_PUBLIC_API_URL`.

---

## Step 1: Deploy FastAPI Backend to Vercel

### 1.1 Create Backend-only Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `isaaclk91207-oss/EduBridge_AI`
4. **Configure Settings:**

| Setting | Value |
|---------|-------|
| **Framework Preset** | Python |
| **Root Directory** | `.` (root) |
| **Build Command** | Leave empty (uses defaults) |
| **Output Directory** | Leave empty |
| **Install Command** | `pip install -r requirements.txt` |

### 1.2 Fix vercel.json for Backend

The `vercel.json` has been updated to point to the correct FastAPI entry point:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app/app.py",
      "use": "@vercel/python"
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/app/app.py"
    }
  ]
}
```

### 1.3 Environment Variables for Backend

Go to **Settings → Environment Variables** and add:

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string (e.g., `postgresql://user:pass@host.neon.tech/db?sslmode=require`) | Production, Preview, Development |
| `SECRET_KEY` | Generate a 32+ character random string | All |
| `PYTHON_VERSION` | `3.11` | All |

### 1.4 Deploy Backend

1. Click **Deploy**
2. Note your backend URL (e.g., `https://edubridge-ai-backend.vercel.app`)

---

## Step 2: Deploy Next.js Frontend to Vercel

### 2.1 Create Frontend-only Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `isaaclk91207-oss/EduBridge_AI`
4. **Configure Settings:**

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `.` (root) |
| **Build Command** | `next build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |

### 2.2 Environment Variables for Frontend

Go to **Settings → Environment Variables** and add:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Your FastAPI backend URL (e.g., `https://edubridge-ai-backend.vercel.app`) | Production, Preview, Development |
| `GEMINI_API_KEY` | Your Google Gemini API key | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | All |
| `NEXT_PUBLIC_SUPABASE_KEY` | Your Supabase anon key | All |

---

## Step 3: Requirements.txt

Your `requirements.txt` at root is already correctly configured:

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

---

## Step 4: Troubleshooting Build Cache

To prevent 500 errors from old cache during first deployment:

### Option A: Disable Build Cache (Recommended for First Deploy)

1. After deployment starts, click **"Cancel Deployment"**
2. Go to **Settings → General**
3. Find **"Build Cache"** and **disable** it
4. Deploy again

### Option B: Clear Cache After Failed Deploy

1. Go to **Dashboard → Deployments**
2. Find the failed deployment
3. Click the **⋮** menu → **"Delete"**
4. Redeploy

---

## Step 5: Verify Deployment

### Test Backend API
Visit: `https://your-backend-url.vercel.app/`

Should return:
```json
{
  "status": "ok",
  "message": "EduBridge AI API is running"
}
```

### Test Frontend
Visit: `https://your-frontend-url.vercel.app`

Should load your Next.js application.

---

## Troubleshooting Common Errors

### Error: "No module named 'psycopg2'" or Database Connection Failed
- **Cause**: `DATABASE_URL` not set in backend environment variables
- **Fix**: Ensure Neon PostgreSQL connection string is set in backend Vercel project

### Error: 500 Internal Server Error on Backend
- **Fix**: Check Vercel Function Logs:
  1. Go to **Dashboard → Functions → Logs**
  2. Find the actual error message
  3. Common fix: Verify `DATABASE_URL` is correct

### Error: Frontend can't connect to Backend
- **Cause**: `NEXT_PUBLIC_API_URL` not set or incorrect
- **Fix**: Verify the frontend environment variable points to your backend URL

### Error: CORS Errors
- **Cause**: Backend CORS whitelist doesn't include your frontend URL
- **Fix**: Update `allow_origins` in `app/app.py` to include your Vercel frontend URL

---

## Quick Reference

| Deployment | Framework Preset | Root Directory | Key Environment Variables |
|------------|------------------|-----------------|---------------------------|
| Backend (FastAPI) | Python | `.` | `DATABASE_URL`, `SECRET_KEY` |
| Frontend (Next.js) | Next.js | `.` | `NEXT_PUBLIC_API_URL`, `GEMINI_API_KEY` |

---

## Post-Deployment Checklist

- [ ] Backend health check returns OK
- [ ] Frontend loads correctly
- [ ] Signup/Login works (tests database connection)
- [ ] API endpoints respond correctly

