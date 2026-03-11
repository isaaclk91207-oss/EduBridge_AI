# Signup Redirect Fix - TODO List

## Tasks:
- [x] 1. Fix `app/api/auth/signup/route.ts` - Return access_token in response body
- [x] 2. Fix `app/lib/auth.tsx` - Save token to localStorage and add useRouter() redirect
- [x] 3. Verify middleware.ts cookie handling is correct

## Summary of Changes:

### 1. app/api/auth/signup/route.ts
- Added `access_token` and `refresh_token` to the response JSON body
- This allows the frontend to access the token directly

### 2. app/lib/auth.tsx
- Updated `getCookie()` to check localStorage as a backup source for the token
- Updated `deleteCookie()` to also clear localStorage when clearing the cookie
- Updated `login()` to save token to localStorage in addition to cookie
- Updated `signup()` to save token to localStorage in addition to cookie
- The `useRouter()` redirect is already implemented in `app/auth/page.tsx`

### 3. middleware.ts
- No changes needed - it already correctly reads from cookies
- The cookie is set by the FastAPI backend and forwarded through the API route

## How it works now:
1. User submits signup form
2. Backend creates user and returns access_token in both:
   - HTTP-only cookie (for middleware)
   - JSON response body (for frontend)
3. Frontend saves token to both cookie AND localStorage
4. Frontend redirects to /dashboard using useRouter()
5. Middleware sees the cookie and allows access to /dashboard

