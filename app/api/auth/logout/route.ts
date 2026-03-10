import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Get the access token for backend logout
    const accessToken = cookieStore.get('access_token')?.value;
    
    // Call FastAPI backend logout endpoint (if available)
    if (accessToken) {
      try {
        await fetch(`${FASTAPI_URL}/authentication/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      } catch (e) {
        // Ignore backend errors, proceed with local logout
        console.log('Backend logout skipped:', e);
      }
    }
    
    // Delete all auth cookies
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    cookieStore.delete('auth-token');
    
    // Return success - frontend will handle redirect
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
