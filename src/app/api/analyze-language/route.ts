import { NextResponse } from 'next/server';
import { anthropicService } from '@/lib/api';

/**
 * API handler for advanced linguistic analysis using Anthropic Claude
 * This route accepts a word or phrase and returns detailed analysis
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const { text } = await request.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid text. Please provide a word or phrase to analyze.' },
        { status: 400 }
      );
    }

    // Log the request for debugging
    console.log(`📝 Language analysis request for: "${text}"`);

    // Call Anthropic service to analyze the text
    const result = await anthropicService.analyzeLanguage(text);

    // Check if there was an error
    if (!result.success || result.error) {
      console.error('❌ Error in language analysis:', result.error);

      return NextResponse.json(
        {
          error: result.error?.message || 'Failed to analyze language',
          code: result.error?.code || 'UNKNOWN_ERROR',
        },
        { status: result.status || 500 }
      );
    }

    // Return the analysis result
    console.log('✅ Language analysis completed successfully');
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    // Handle any other errors
    console.error('❌ Server error in language analysis route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * For GET requests, return an explanation of how to use this API
 */
export async function GET() {
  return NextResponse.json({
    info: 'Language Analysis API',
    usage: 'Send a POST request with a JSON body containing a "text" field with the word or phrase to analyze',
    example: {
      request: { text: 'eloquent' },
      response: {
        etymology: { /* origin, history, etc */ },
        semantics: { /* meaning, nuances, etc */ },
        usage: { /* examples, collocations, etc */ },
        related: { /* synonyms, antonyms, etc */ },
        register: { /* formality, connotation, etc */ }
      }
    }
  }, { status: 200 });
}