import { NextRequest, NextResponse } from 'next/server';

// Use centralized API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or localStorage (passed in header)
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Try to get token from query param (passed from client-side)
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('Profile API - Request to:', `${API_URL}/user/profile`);
    console.log('Profile API - Has auth header:', !!authHeader);
    console.log('Profile API - Has cookie:', !!cookieHeader);
    console.log('Profile API - Has token param:', !!token);

    // Forward request to FastAPI backend with Authorization header
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Use Authorization header if available, otherwise forward cookies
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        'Cookie': cookieHeader
      },
      credentials: 'include'
    });

    console.log('Profile API - Backend response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch profile' }));
      // Don't treat 404 as auth failure - just return empty profile
      if (response.status === 404) {
        return NextResponse.json({
          firstName: '',
          lastName: '',
          email: '',
          major: '',
          studentType: 'Public'
        });
      }
      return NextResponse.json(
        { error: error.detail || 'Failed to fetch profile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform FastAPI response to match frontend expected format
    return NextResponse.json({
      firstName: data.username?.split(' ')[0] || '',
      lastName: data.username?.split(' ').slice(1).join(' ') || '',
      email: data.email || '',
      major: data.major || '',
      studentType: data.studentType || 'Public',
      id: data.id
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    // Return default profile instead of error to prevent auth loop
    return NextResponse.json({
      firstName: '',
      lastName: '',
      email: '',
      major: '',
      studentType: 'Public'
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform frontend data to FastAPI expected format
    const fastApiBody = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      major: body.major,
      studentType: body.studentType
    };

    // Forward request to FastAPI backend
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      credentials: 'include',
      body: JSON.stringify(fastApiBody)
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to update profile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}
