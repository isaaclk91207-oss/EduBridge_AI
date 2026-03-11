# Debugging Backend Connection Issues

## Understanding the Error

**"SyntaxError: Unexpected token 'T', 'The deploy' is not valid JSON"**

This error means your **frontend is receiving HTML instead of JSON**. The "T" likely comes from "The deploy is in progress..." or similar HTML page from Render.

## Root Causes

1. **Backend crashed on startup** - Missing environment variable like `DATABASE_URL`
2. **Backend is still deploying** - Render is rebuilding the service
3. **Backend returned an error page** - Any 500 error that returns HTML instead of JSON
4. **Frontend calling wrong URL** - Requests going to Vercel instead of Render

## How to Debug in Browser

### 1. Open Network Tab
- Press F12 to open Developer Tools
- Go to **Network** tab
- Make the failing request again
- Click on the request (e.g., `signup`)
- Look at **Response** tab

### 2. What to Look For
If you see HTML content starting with:
- `<!DOCTYPE html>` - It's an error page
- `<html` - It's an error page  
- "The deploy" - Render's deployment page
- "Application error" - Runtime crash
- "Internal Server Error" - Backend crashed

### 3. Check Response Headers
- **Content-Type**: Should be `application/json`
- If it's `text/html`, you're getting an error page

## What I Fixed

I've updated the frontend to use direct URLs to the Render backend:

### 1. app/lib/api.ts
- Changed to use **hardcoded backend URL**: `https://edubridge-ai-ui2j.onrender.com`
- Added `buildApiUrl()` function that always returns the full URL
- Fixed endpoints to match backend: `/api/auth/register` (not `/api/auth/signup`)

### 2. app/lib/auth.tsx  
- Updated all fetch calls to use `buildApiUrl(API_ENDPOINTS.LOGIN)` etc.
- Added console.log to debug the actual URL being called

### 3. next.config.ts
- Added rewrites to proxy `/api/*` requests to the Render backend

## Setting NEXT_PUBLIC_API_URL in Vercel (Optional)

If you want to use environment variables instead of hardcoded URLs:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://edubridge-ai-ui2j.onrender.com`
3. **Important**: Add the same variable for all environments (Production, Preview, Development)
4. Redeploy your Vercel project

## Quick Checklist

- [ ] Check browser console - do you see the correct URL being logged?
- [ ] Check Network tab - is the request going to `edubridge-ai-ui2j.onrender.com`?
- [ ] Test backend directly: `curl https://edubridge-ai-ui2j.onrender.com/`
- [ ] Check Render logs for backend errors

