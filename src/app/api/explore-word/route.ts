import { NextResponse } from "next/server";
import { validateServiceEnv } from "@/lib/env-validator";

// Set maximum duration for this API route
export const maxDuration = 60;

// Enable dynamic runtime to bypass edge caching for this route
// This is important for AI responses which are user-specific
export const dynamic = 'force-dynamic';

/**
 * GET handler for /api/explore-word endpoint
 *
 * This endpoint accepts a word and returns detailed information
 * about that word, including etymology, related words, and usage trends.
 * In a production setup, this would connect to Perplexity or another language model API.
 *
 * @param {Request} request - The incoming request with word parameter
 * @returns {NextResponse} Response containing word analysis data
 */
export async function GET(request: Request) {
  try {
    // Get the query parameters
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');

    // Validate environment variables
    const perplexityEnv = validateServiceEnv('perplexity');
    if (!perplexityEnv.valid) {
      console.error(`[API] Missing Perplexity API environment variables: ${perplexityEnv.missing.join(', ')}`);
      return NextResponse.json(
        {
          message: "API service is not properly configured",
          details: process.env.NODE_ENV === 'development' ? perplexityEnv.missing : undefined
        },
        { status: 500 }
      );
    }

    // Validate the word parameter
    if (!word) {
      return NextResponse.json(
        { message: "Word parameter is required" },
        { status: 400 }
      );
    }

    console.log(`[API] Exploring word: ${word}`);

    // For demo purposes, we'll return mock data
    // In a real implementation, this would call the Perplexity API
    const wordData = getMockWordData(word);

    // Add cache control headers for Vercel edge network
    return NextResponse.json(wordData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Vercel-CDN-Cache-Control': 'no-cache',
      }
    });

    /*
    // This would be the actual Perplexity API implementation
    try {
      // Create Perplexity API client
      const client = createPerplexityClient({
        apiKey: process.env.PERPLEXITY_API_KEY,
      });

      // Create a prompt for the model
      const prompt = `
        Analyze the word "${word}" and provide the following information in JSON format:

        1. Core meaning: A concise explanation of what the word fundamentally means
        2. Etymology: The origin and historical development of the word
        3. Related words: A list of synonyms, antonyms, and conceptually related terms
        4. Usage trends: How the word is being used today, including popularity and contexts

        Format your response as valid JSON.
      `;

      // Send the request to Perplexity
      const modelResponse = await client.messages.create({
        model: 'sonar-small-online',
        messages: [{ role: 'user', content: prompt }],
      });

      // Parse the JSON from the response
      const content = modelResponse.choices[0].message.content;
      const jsonMatch = content.match(/({.*})/s);

      if (!jsonMatch) {
        throw new Error('Failed to parse JSON response from Perplexity');
      }

      // Parse the JSON data
      const parsedData = JSON.parse(jsonMatch[0]);

      // Return the parsed data
      return NextResponse.json(parsedData, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Vercel-CDN-Cache-Control': 'no-cache',
        }
      });
    } catch (perplexityError) {
      console.error('[API] Perplexity API error:', perplexityError);

      // Return mock data as fallback
      return NextResponse.json(wordData, {
        status: 200,
        headers: {
          'X-Fallback': 'true',
          'Cache-Control': 'no-store, must-revalidate',
        }
      });
    }
    */

  } catch (error) {
    // Log the error with details for debugging
    console.error("[API] Word exploration error:", error);

    // Return a structured error response
    return NextResponse.json(
      {
        message: "An error occurred while exploring the word",
        error: error instanceof Error ? error.message : "Unknown error",
        // Only include stack trace in development
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    );
  }
}

/**
 * Helper function to return mock data for words
 * Used when API integration is not available
 */
function getMockWordData(word: string): WordData {
  // Dictionary of common words with pre-defined data
  const commonWords: Record<string, WordData> = {
    "eloquent": {
      word: "eloquent",
      coreMeaning: "Fluent, persuasive, and expressive in speech or writing, indicating a natural talent for using language effectively.",
      etymology: "From Latin 'eloquentem', present participle of 'eloqui' meaning 'to speak out'.",
      relatedWords: [
        { word: "articulate", type: "adjective", meaning: "Having or showing the ability to speak fluently and coherently" },
        { word: "expressive", type: "adjective", meaning: "Effectively conveying thought or feeling" },
        { word: "persuasive", type: "adjective", meaning: "Good at convincing someone to do or believe something" },
        { word: "rhetoric", type: "noun", meaning: "The art of effective or persuasive speaking or writing" },
      ],
      usageTrends: {
        popularity: 65,
        contexts: ["Literature", "Public Speaking", "Politics", "Academia"]
      }
    },
    "vibrant": {
      word: "vibrant",
      coreMeaning: "Full of energy, brightness, and life; producing a strong or striking impression through brightness or intensity.",
      etymology: "From Latin 'vibrantem', present participle of 'vibrare' meaning 'to shake or brandish'.",
      relatedWords: [
        { word: "vivid", type: "adjective", meaning: "Producing strong, clear images in the mind" },
        { word: "lively", type: "adjective", meaning: "Full of life and energy; active and outgoing" },
        { word: "dynamic", type: "adjective", meaning: "Characterized by energy and effective action" },
        { word: "colorful", type: "adjective", meaning: "Full of interest and variety" },
      ],
      usageTrends: {
        popularity: 72,
        contexts: ["Art", "Fashion", "Photography", "Travel"]
      }
    },
    "serendipity": {
      word: "serendipity",
      coreMeaning: "The occurrence and development of events by chance in a happy or beneficial way; a fortunate discovery made by accident.",
      etymology: "Coined by Horace Walpole in 1754 from a Persian fairy tale, 'The Three Princes of Serendip', where the heroes were always making discoveries by accident.",
      relatedWords: [
        { word: "chance", type: "noun", meaning: "A possibility of something happening" },
        { word: "fortunate", type: "adjective", meaning: "Bringing good luck; favorable or advantageous" },
        { word: "coincidence", type: "noun", meaning: "A remarkable concurrence of events without apparent causal connection" },
        { word: "fortuitous", type: "adjective", meaning: "Happening by chance; having no apparent cause" },
      ],
      usageTrends: {
        popularity: 78,
        contexts: ["Literature", "Science", "Dating", "Travel"]
      }
    }
  };

  // Return data for known words or generate generic data
  if (commonWords[word.toLowerCase()]) {
    return commonWords[word.toLowerCase()];
  }

  // For unknown words, return a generic structure
  return {
    word: word.toLowerCase(),
    coreMeaning: `The meaning and nuances of "${word}" would be explored in depth here.`,
    etymology: `The etymological roots of "${word}" would be traced here.`,
    relatedWords: [
      { word: `${word}-related1`, type: "noun", meaning: "A related word or concept" },
      { word: `${word}-related2`, type: "verb", meaning: "An action related to the word" },
      { word: `${word}-related3`, type: "adjective", meaning: "A descriptive quality related to the word" },
    ],
    usageTrends: {
      popularity: Math.floor(Math.random() * 100),
      contexts: ["Context 1", "Context 2", "Context 3"]
    }
  };
}

// Define the type for word data
interface WordData {
  word: string;
  coreMeaning: string;
  etymology: string;
  relatedWords: {
    word: string;
    type: string;
    meaning: string;
  }[];
  usageTrends: {
    popularity: number;
    contexts: string[];
  };
}