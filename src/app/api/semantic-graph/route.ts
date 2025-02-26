import { NextResponse } from "next/server";
import { validateServiceEnv } from "@/lib/env-validator";
import { generateSemanticGraph, enrichSemanticGraph } from "@/lib/semantic-graph/generate-graph";

// Set maximum duration for this API route
export const maxDuration = 60;

// Enable dynamic runtime to bypass edge caching for this route
export const dynamic = 'force-dynamic';

/**
 * GET handler for /api/semantic-graph endpoint
 *
 * This endpoint accepts a word and returns a semantic graph
 * representing the word's relationships to other words and concepts.
 *
 * @param {Request} request - The incoming request with word parameter
 * @returns {NextResponse} Response containing semantic graph data
 */
export async function GET ( request: Request )
{
  try
  {
    // Get the query parameters
    const { searchParams } = new URL( request.url );
    const word = searchParams.get( 'word' );
    const enrichData = searchParams.get( 'enrich' ) === 'true';

    // Validate environment variables
    const perplexityEnv = validateServiceEnv( 'perplexity' );
    if ( !perplexityEnv.valid )
    {
      console.error( `[API] Missing Perplexity API environment variables: ${ perplexityEnv.missing.join( ', ' ) }` );
      return NextResponse.json(
        {
          message: "API service is not properly configured",
          details: process.env.NODE_ENV === 'development' ? perplexityEnv.missing : undefined
        },
        { status: 500 }
      );
    }

    // Validate the word parameter
    if ( !word )
    {
      return NextResponse.json(
        { message: "Word parameter is required" },
        { status: 400 }
      );
    }

    console.log( `[API] Generating semantic graph for word: ${ word }` );

    // First, get the word data from our explore-word API
    const wordDataResponse = await fetch( `${ process.env.NEXT_PUBLIC_API_URL || '' }/api/explore-word?word=${ encodeURIComponent( word ) }` );

    if ( !wordDataResponse.ok )
    {
      const errorData = await wordDataResponse.json();
      throw new Error( errorData.message || `Error fetching word data: ${ wordDataResponse.status }` );
    }

    const wordData = await wordDataResponse.json();

    // Generate the semantic graph from the word data
    let graph = generateSemanticGraph( wordData );

    // Optionally enrich the graph with additional data
    if ( enrichData )
    {
      console.log( `[API] Enriching semantic graph for word: ${ word }` );
      graph = await enrichSemanticGraph( graph );
    }

    // Add cache control headers for Vercel edge network
    return NextResponse.json( graph, {
      status: 200,
      headers: {
        'Cache-Control': 'max-age=3600, s-maxage=3600', // Cache for 1 hour
        'Vercel-CDN-Cache-Control': 'max-age=3600',
      }
    } );

  } catch ( error )
  {
    // Log the error with details for debugging
    console.error( "[API] Semantic graph generation error:", error );

    // Return a structured error response
    return NextResponse.json(
      {
        message: "An error occurred while generating the semantic graph",
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