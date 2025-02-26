import { NextResponse } from 'next/server';

/**
 * Perplexity API handler
 *
 * This endpoint forwards requests to the Perplexity API and returns the response.
 * It serves as the primary AI backend during our initial deployment phase.
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { prompt, options = {} } = body;

    // Validate the request
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Log that we're making a request to Perplexity
    console.log(`📝 Sending request to Perplexity API: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);

    // Create the API request
    const perplexityUrl = process.env.PERPLEXITY_API_URL || 'https://api.perplexity.ai';
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      console.error('❌ No Perplexity API key found in environment variables');
      return NextResponse.json(
        { error: 'API configuration error. Please check server logs.' },
        { status: 500 }
      );
    }

    // Configure the model parameters
    const modelConfig = {
      model: options.model || 'pplx-70b-online', // Use online model by default for web access
      messages: [
        {
          role: 'system',
          content: options.systemPrompt || 'You are a helpful AI language model that assists with linguistic exploration and word meaning.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
      stream: options.stream || false
    };

    // Send the request to Perplexity
    const response = await fetch(`${perplexityUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(modelConfig)
    });

    // Handle streaming responses if requested
    if (options.stream) {
      // Return the stream directly
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    }

    // For non-streaming responses, parse and return the JSON
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Perplexity API error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to get response from Perplexity' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract and return just the AI's response
    const result = {
      text: data.choices?.[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };

    console.log('✅ Successfully received response from Perplexity API');
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Server error in Perplexity route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Set maximum duration for this API route
export const maxDuration = 60;

// Ensure this route is always dynamically evaluated
export const dynamic = 'force-dynamic';