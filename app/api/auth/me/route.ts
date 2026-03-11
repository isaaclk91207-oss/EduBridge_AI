import { NextRequest, NextResponse } from 'next/server';

// FastAPI backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Forward the request to the FastAPI backend's /authentication/login endpoint
    // This endpoint checks if the token is valid and returns user info
    const response = await fetch(`${API_URL}/authentication/login`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      // Return user data in a consistent format
      return NextResponse.json({
        id: data.user_id,
        email: data.email,
        username: data.email?.split('@')[0] || 'User',
        authenticated: true
      });
    } else if (response.status === 401) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    } else {
      return NextResponse.json(
        { authenticated: false, error: 'Failed to verify token' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Authentication service unavailable' },
      { status: 503 }
    );
  }
}

