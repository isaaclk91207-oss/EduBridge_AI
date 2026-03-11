import { NextRequest, NextResponse } from 'next/server';

// Use centralized API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';

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

    // CRITICAL: Log the URL being called for debugging
    // Always include fallback to ensure the URL is never undefined
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';
    console.log('NEXT_PUBLIC_API_URL env:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Full login URL:', `${API_URL}/authentication/login`);

    // Forward login request to FastAPI backend with JSON data
    // Backend expects JSON with email field (not username)
    const response = await fetch(`${API_URL}/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    console.log('Login API - Backend response status:', response.status);

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
    console.log('Login API - Backend response data keys:', Object.keys(data));

    // Forward the Set-Cookie header from FastAPI to the client
    const setCookieHeader = response.headers.get('set-cookie');
    const nextResponse = NextResponse.json({
      success: true,
      access_token: data.access_token, // Include token in response body
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
    const response = await fetch(`${API_URL}/authentication/login`, {
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
