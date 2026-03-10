import { NextRequest, NextResponse } from 'next/server';

// FastAPI backend URL
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Forward login request to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      // Handle FastAPI error format
      let errorMessage = 'Invalid email or password';
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else {
          errorMessage = JSON.stringify(error.detail);
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Forward the Set-Cookie header from FastAPI to the client
    const setCookieHeader = response.headers.get('set-cookie');
    const nextResponse = NextResponse.json({
      success: true,
      user: data.user
    });

    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend. Please make sure the backend server is running.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Forward auth check to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/authentication/login`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error('Auth check error:', error);
    // Return authenticated: false when backend is unavailable instead of throwing error
    return NextResponse.json({ authenticated: false });
  }
}
