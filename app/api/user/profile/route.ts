import { NextRequest, NextResponse } from 'next/server';

// FastAPI backend URL - change this to your actual backend URL
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Forward request to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies from the client request
        'Cookie': request.headers.get('cookie') || ''
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
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
      studentType: data.studentType || 'Public'
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
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
    const response = await fetch(`${FASTAPI_URL}/user/profile`, {
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
