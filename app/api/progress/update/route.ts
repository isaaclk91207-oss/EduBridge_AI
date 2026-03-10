import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { course_id, lecture_id, status, watch_time_seconds } = body;

    // Validate required fields
    if (!course_id || !lecture_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: course_id, lecture_id, status' },
        { status: 400 }
      );
    }

    // Get the user from the cookie or header
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Call FastAPI backend to update progress
    const response = await fetch(`${FASTAPI_URL}/progress/update-lecture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
      body: JSON.stringify({
        course_id,
        lecture_id,
        status,
        watch_time_seconds: watch_time_seconds || 0
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to update progress' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get course progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get('course_id');

    if (!course_id) {
      return NextResponse.json(
        { error: 'Missing course_id parameter' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Call FastAPI backend to get progress
    const response = await fetch(
      `${FASTAPI_URL}/progress/course/${course_id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to get progress' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
