import { NextResponse } from 'next/server';
import { AI_CONFIG, ImageGenerationResponse } from '@/lib/ai-config';
import Replicate from 'replicate';
import { validateServiceEnv } from "@/lib/env-validator";

/**
 * API handler for generating images using Replicate's Flux model
 * Includes comprehensive error handling and fallbacks
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const { prompt } = await request.json();

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt. Please provide a text prompt.' },
        { status: 400 }
      );
    }

    // Log the request for debugging
    console.log(`📝 Image generation request for prompt: "${prompt}"`);

    // Check if the Replicate API token is available
    const { apiToken, fluxModel } = AI_CONFIG.replicate;

    if (!apiToken) {
      console.warn('⚠️ No Replicate API token found. Using fallback image.');
      return NextResponse.json(
        createFallbackResponse(prompt, 'No API token configured'),
        { status: 200 }
      );
    }

    // Call Replicate API
    try {
      // Initialize Replicate client
      const replicate = new Replicate({
        auth: apiToken,
      });

      // Prepare the request to Replicate
      const enhancedPrompt = enhancePrompt(prompt);

      console.log(`🤖 Sending request to Replicate for model: ${fluxModel}`);

      // Call Replicate API with Flux model
      const output = await replicate.run(
        fluxModel as `${string}/${string}` | `${string}/${string}:${string}`,
        {
          input: {
            prompt: enhancedPrompt,
            prompt_upsampling: true,
            width: 512,  // Standard size
            height: 512,
            num_inference_steps: 25,
            scheduler: "K_EULER",
            guidance_scale: 7.5,
          },
        }
      );

      // Replicate typically returns a URL or array of URLs
      // Let's handle both cases
      let imageUrl = '';
      if (Array.isArray(output)) {
        imageUrl = output[0];
      } else if (typeof output === 'string') {
        imageUrl = output;
      } else {
        throw new Error('Unexpected response format from Replicate');
      }

      // Return the generated image URL
      const imageResponse: ImageGenerationResponse = {
        url: imageUrl,
        prompt,
        model: fluxModel,
      };

      console.log('✅ Image successfully generated from Replicate');
      return NextResponse.json(imageResponse, { status: 200 });
    } catch (error) {
      // Handle errors from Replicate
      console.error('❌ Error calling Replicate API:', error);
      return NextResponse.json(
        createFallbackResponse(prompt, error instanceof Error ? error.message : String(error)),
        { status: 200 }
      );
    }
  } catch (error) {
    // Handle any other errors
    console.error('❌ Server error in image generation route:', error);
    return NextResponse.json(
      { error: 'Internal server error', fallback: true },
      { status: 500 }
    );
  }
}

/**
 * Creates a fallback response when image generation fails
 */
function createFallbackResponse(prompt: string, errorMessage: string): ImageGenerationResponse {
  const { fallback } = AI_CONFIG.replicate;

  // Select a random fallback image if available
  let fallbackUrl = fallback.placeholderUrl;
  if (fallback.enabled && fallback.localImages.length > 0) {
    const randomIndex = Math.floor(Math.random() * fallback.localImages.length);
    fallbackUrl = fallback.localImages[randomIndex];
  }

  return {
    url: fallbackUrl,
    prompt,
    error: errorMessage,
    fallback: true,
  };
}

/**
 * Enhances the user prompt for better image generation results
 */
function enhancePrompt(basePrompt: string): string {
  // Add styling and quality keywords to improve generation results
  return `${basePrompt}, high quality, detailed, 4k, professional, clear visualization, educational, minimalist style, elegant design`;
}

// Set maximum duration for this API route to handle longer
// image generation times
export const maxDuration = 45;

// Enable dynamic runtime to bypass edge caching for this route
export const dynamic = 'force-dynamic';

/**
 * Demo implementation for the generate-image endpoint.
 * This is kept as reference but not exported as a route handler.
 *
 * To use this instead of the main POST handler, rename this to POST
 * and rename the existing POST to something else.
 *
 * @param {Request} request - The incoming request with prompt data
 * @returns {NextResponse} Response containing image URL
 */
// Not exported as a route handler to avoid Next.js API route type errors
async function _postDemo(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { prompt } = body;

    // Validate environment variables
    const replicateEnv = validateServiceEnv('replicate');
    const isMissingEnvVars = !replicateEnv.valid;

    // Validate the prompt parameter
    if (!prompt) {
      return NextResponse.json(
        { message: "Prompt parameter is required" },
        { status: 400 }
      );
    }

    console.log(`[API] Generating image for prompt: ${prompt}`);

    // For demo purposes, we'll return a placeholder image
    // In a real implementation, this would call the Replicate API
    return NextResponse.json({
      url: "/fallback/image-placeholder.svg",
      prompt: prompt,
      model: "mock-image-model",
      width: 512,
      height: 512,
      message: isMissingEnvVars
        ? "Using placeholder image due to missing API configuration"
        : "Using placeholder image for demo purposes"
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      }
    });

    /*
    // This would be the actual Replicate implementation
    if (isMissingEnvVars) {
      console.warn('[API] Missing Replicate environment variables');
      return NextResponse.json({
        url: "/fallback/image-placeholder.svg",
        prompt: prompt,
        model: "fallback",
        width: 512,
        height: 512,
        message: "Using placeholder image due to missing API configuration"
      }, { status: 200 });
    }

    // Call Replicate API to generate image
    // Example implementation using the API directly
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: process.env.REPLICATE_FLUX_MODEL,
        input: {
          prompt: prompt,
          width: 512,
          height: 512,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Replicate API error: ${error.detail || response.statusText}`);
    }

    const prediction = await response.json();

    // For a real implementation, you'd need to poll the prediction status
    // until it's completed, then return the output URL

    return NextResponse.json({
      url: prediction.output[0], // This would be the image URL in the actual implementation
      prompt: prompt,
      model: process.env.REPLICATE_FLUX_MODEL,
      width: 512,
      height: 512
    }, { status: 200 });
    */

  } catch (error) {
    console.error("[API] Image generation error:", error);

    return NextResponse.json({
      message: "An error occurred while generating the image",
      error: error instanceof Error ? error.message : "Unknown error",
      url: "/fallback/image-placeholder.svg", // Always fall back to a placeholder on error
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  }
}