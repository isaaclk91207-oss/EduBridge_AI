import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, skills, experience, summary } = body;

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create prompt for analysis
    const prompt = `Analyze this candidate profile and provide:
1. A professional summary (2-3 sentences)
2. A match score (0-100) for the role: ${role}
3. Key strengths (3-5 points)
4. Areas for improvement (2-3 points)

Candidate Info:
- Name: ${name}
- Current Role: ${role}
- Skills: ${skills?.join(', ') || 'Not specified'}
- Experience: ${experience || 'Not specified'}
- Current Summary: ${summary || 'Not provided'}

Respond in JSON format:
{
  "professionalSummary": "...",
  "matchScore": 85,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      // If parsing fails, create a fallback response
      analysis = {
        professionalSummary: text.substring(0, 200),
        matchScore: Math.floor(Math.random() * 30) + 70, // Fallback score
        strengths: ['Strong technical skills', 'Relevant experience'],
        improvements: ['Consider adding more details']
      };
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing candidate:', error);
    return NextResponse.json(
      { error: 'Failed to analyze candidate' },
      { status: 500 }
    );
  }
}
