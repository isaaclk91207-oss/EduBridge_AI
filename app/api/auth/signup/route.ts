import { NextRequest, NextResponse } from 'next/server';

// FastAPI backend URL
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, studentType, major } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Forward signup request to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/authentication/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ 
        email, 
        password, 
        username: name,
        student_type: studentType || 'public',
        major: major || ''
      })
    });

    if (!response.ok) {
      const error = await response.json();
      // Handle FastAPI validation error format
      let errorMessage = 'User already exists';
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          // FastAPI returns array of validation errors
          errorMessage = error.detail.map((e: unknown) => {
            if (typeof e === 'object' && e !== null && 'msg' in e) {
              return (e as { msg: string }).msg;
            }
            return JSON.stringify(e);
          }).join(', ');
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Forward auth check to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/authentication/register`, {
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
