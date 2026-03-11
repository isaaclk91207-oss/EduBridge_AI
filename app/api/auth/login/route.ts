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

    // Get response text first to debug
    const responseText = await response.text();
    console.log('Login API - Raw response:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      // Handle FastAPI error format
      let errorMessage = 'Invalid email or password';
      if (data && data.detail) {
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else {
          errorMessage = JSON.stringify(data.detail);
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

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
    // Provide more detailed error information
    let errorMessage = 'Failed to connect to backend. Please make sure the backend server is running.';
    
    if (error instanceof Error && error.message.includes('fetch')) {
      // Network error - backend is unreachable
      console.error('Network error - backend may be down or URL is incorrect');
      errorMessage = 'Cannot connect to backend server. Please try again later.';
    } else if (error instanceof Error) {
      console.error('Error details:', error.message);
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
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
