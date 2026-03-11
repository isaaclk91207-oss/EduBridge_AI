# Authentication Debug Guide

## How to Debug the Authentication Loop

### 1. Check Browser Console (F12)
Look for these debug logs I added:
- `checkAuth - Token from cookie:` - Shows if token exists
- `Login URL:` - Shows the full URL being called
- `Login response:` - Shows the backend response

### 2. Check Cookies in Browser
1. Open DevTools (F12) → Application tab → Cookies
2. Look for `access_token` cookie
3. If it doesn't exist, login is not saving the token

### 3. Check Network Tab
1. Go to Network tab
2. Look for requests to `/api/auth/login` and `/api/auth/me`
3. Check if they're going to `edubridge-ai-ui2j.onrender.com`
4. Check the Response to see if token is returned

### 4. Test the Backend Directly
```bash
# Test login
curl -X POST https://edubridge-ai-ui2j.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com", "password": "password123"}'

# Test /me endpoint with token
curl -X GET https://edubridge-ai-ui2j.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Verify Token Format
The middleware expects a JWT token with 3 parts separated by dots:
- `header.payload.signature`
If your backend returns a simple string like `mock_token_xxx`, it won't be parsed correctly.

## Common Issues

### Issue: Token not saved to cookie
**Symptom:** Login succeeds but redirects to login page again
**Fix:** Check console for `setCookie` calls - the login function now saves token to cookie

### Issue: Middleware can't read token
**Symptom:** Redirect loop even after successful login
**Fix:** Token must be in `access_token` cookie with JWT format

### Issue: Backend /me endpoint fails
**Symptom:** Console shows `/me response status: 401` or `500`
**Fix:** The backend /me endpoint needs to validate the JWT token

## What Was Fixed

1. **app/lib/auth.tsx** - Now saves token to cookie after login:
   ```javascript
   setCookie('access_token', data.access_token, 7);
   ```

2. **checkAuth()** - Now reads from cookie AND sends Authorization header:
   ```javascript
   const token = getCookie('access_token');
   // Then calls /me with: 'Authorization': `Bearer ${token}`
   ```

3. **logout()** - Now properly clears the cookie

4. **Error handling** - Now properly handles Pydantic validation errors:
   ```javascript
   // The error format from FastAPI/Pydantic is:
   // { detail: [{ type, loc, msg, input }] }
   
   if (Array.isArray(response.detail)) {
     errorMessage = response.detail.map((err) => {
       return err.msg || err.message || JSON.stringify(err);
     }).join(', ');
   }
   ```

## Understanding Pydantic Validation Errors

When your FastAPI backend returns a validation error, it looks like this:
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "input": "not-an-email"
    }
  ]
}
```

The code now extracts the `msg` field to display a human-readable error.

