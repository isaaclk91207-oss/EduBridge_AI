import { NextRequest, NextResponse } from 'next/server';

// Piston API - Free code execution service
const PISTON_API = 'https://emkc.org/api/v2/piston';

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { success: false, error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Map language to Piston format
    const languageMap: Record<string, { language: string; version: string }> = {
      python: { language: 'python', version: '3.10.0' },
      javascript: { language: 'javascript', version: '18.15.0' },
      cpp: { language: 'c++', version: '10.2.0' },
      java: { language: 'java', version: '15.0.2' },
    };

    const langConfig = languageMap[language];
    if (!langConfig) {
      return NextResponse.json(
        { success: false, error: `Language ${language} not supported` },
        { status: 400 }
      );
    }

    // Make request to Piston API
    const response = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: language === 'python' ? 'main.py' : 
                  language === 'java' ? 'Main.java' : 
                  language === 'cpp' ? 'main.cpp' : 'main.js',
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Connection failed: HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (result.run) {
      const stdout = result.run.stdout || '';
      const stderr = result.run.stderr || '';
      const compileOutput = result.compile?.output || '';

      // If there's stderr or compile errors, show as error
      if (stderr || compileOutput) {
        return NextResponse.json({
          success: false,
          output: stdout,
          error: stderr || compileOutput,
        });
      }

      return NextResponse.json({
        success: true,
        output: stdout || '(No output)',
        error: null,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Execution failed - no output received' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Code execution error:', error);
    
    // Provide specific error messages
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return NextResponse.json(
        { success: false, error: 'Connection timeout - please try again' },
        { status: 504 }
      );
    }
    
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
      return NextResponse.json(
        { success: false, error: 'Connection failed - Piston API unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Execution failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
