import { NextResponse } from 'next/server';

export interface RoadmapStep {
  title: string;
  description: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface RoadmapRequest {
  topic: string;
}

export interface RoadmapResponse {
  success: boolean;
  roadmap?: RoadmapStep[];
  error?: string;
}

// Helper to call Pollinations.ai text API
async function callPollinationsAI(prompt: string): Promise<string> {
  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates learning roadmaps in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'openai',
      seed: Math.floor(Math.random() * 1000),
      json: true
    }),
  });

  if (!response.ok) {
    throw new Error(`Pollinations.ai API error: ${response.status}`);
  }

  return await response.text();
}

// Generate roadmap steps using Pollinations.ai
async function generateRoadmapSteps(topic: string): Promise<RoadmapStep[]> {
  const prompt = `Generate a detailed 5-step learning roadmap for "${topic}". 

Respond ONLY with a valid JSON array (no markdown, no explanation). Each step must have:
- title: Short catchy title for the step
- description: 1-2 sentences describing what to learn
- imagePrompt: A detailed image prompt describing a visual representation of this learning step (use keywords like: 3d render, blue theme, illustration, soft lighting)

Example format:
[
  {
    "title": "Step 1: Foundation",
    "description": "Learn the basics and fundamentals",
    "imagePrompt": "A beginner student reading a book about basics, 3d render, blue theme, soft lighting, minimalist style"
  }
]

Make each imagePrompt creative and visually interesting. Focus on showing the learning activity in a clean, appealing way.`;

  const responseText = await callPollinationsAI(prompt);
  
  // Parse the JSON response
  const parsed = JSON.parse(responseText);
  
  // Handle both array directly or wrapped in object
  if (Array.isArray(parsed)) {
    return parsed;
  } else if (parsed.steps) {
    return parsed.steps;
  } else if (parsed.roadmap) {
    return parsed.roadmap;
  }
  
  // Try to find any array in the response
  const keys = Object.keys(parsed);
  for (const key of keys) {
    if (Array.isArray(parsed[key])) {
      return parsed[key];
    }
  }
  
  throw new Error('Could not parse roadmap steps from response');
}

// Generate image URL using Pollinations.ai
function generatePollinationsImageUrl(prompt: string): string {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
}

// POST handler
export async function POST(request: Request) {
  try {
    // Parse request body
    const body: RoadmapRequest = await request.json();
    const { topic } = body;

    if (!topic || topic.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate roadmap steps using Pollinations.ai
    const steps = await generateRoadmapSteps(topic.trim());

    // Generate images for each step using Pollinations.ai
    const roadmapWithImages: RoadmapStep[] = steps.map((step) => ({
      ...step,
      imageUrl: generatePollinationsImageUrl(step.imagePrompt)
    }));

    return NextResponse.json({
      success: true,
      roadmap: roadmapWithImages
    });

  } catch (error) {
    console.error('Roadmap generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
