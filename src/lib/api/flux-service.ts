/**
 * Flux Image Generation Service
 * Handles image generation via Replicate's Flux model with consistent error handling and fallbacks
 */
import { ApiService } from './api-service';
import {
  ApiResponse,
  ImageGenerationRequest,
  ImageGenerationResponse
} from './types/api-types';
import { AI_CONFIG } from '@/lib/ai-config';

export class FluxService extends ApiService {
  private fallbackEnabled: boolean;
  private fallbackImages: string[];
  private placeholderUrl: string;
  private fluxModel: string;

  constructor() {
    // Configure from our AI configuration
    const { apiToken, fluxModel, fallback } = AI_CONFIG.replicate;
    // Use a default API URL for Replicate
    const baseUrl = 'https://api.replicate.com';

    super('FluxService', {
      baseUrl,
      apiKey: apiToken,
      defaultTimeout: 30000, // Image generation takes longer
    });

    this.fluxModel = fluxModel || 'black-forest-labs/flux-1.1-pro';
    this.fallbackEnabled = fallback.enabled;
    this.fallbackImages = fallback.localImages;
    this.placeholderUrl = fallback.placeholderUrl;
  }

  /**
   * Generate an image from a text prompt
   */
  public async generateImage(request: ImageGenerationRequest): Promise<ApiResponse<ImageGenerationResponse>> {
    // Check if API token is available
    if (!this.config.apiKey) {
      console.warn('⚠️ No Replicate API token found. Using fallback image.');
      return this.createFallbackResponse(request.prompt, 'No API token configured');
    }

    try {
      // Enhance prompt if needed
      const prompt = request.enhancePrompt !== false
        ? this.enhancePrompt(request.prompt, request.style || 'minimalist')
        : request.prompt;

      // For direct Replicate API access, we'd use their SDK
      // But for consistent error handling, we'll use our API layer to call the server-side endpoint
      const response = await this.post<ImageGenerationResponse>('/api/generate-image', {
        prompt,
        width: request.width || 512,
        height: request.height || 512,
        style: request.style,
      });

      // If there was an error from the API but we have fallbacks, use them
      if (!response.success && this.fallbackEnabled) {
        return this.createFallbackResponse(
          request.prompt,
          response.error?.message || 'Failed to generate image'
        );
      }

      return response;
    } catch (error) {
      console.error('❌ Error in FluxService.generateImage:', error);
      return this.createFallbackResponse(
        request.prompt,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Get a random fallback image or placeholder
   */
  public getFallbackImage(): string {
    if (!this.fallbackEnabled || this.fallbackImages.length === 0) {
      return this.placeholderUrl;
    }

    // Select random image from fallback options
    const randomIndex = Math.floor(Math.random() * this.fallbackImages.length);
    return this.fallbackImages[randomIndex];
  }

  /**
   * Creates a successful response with a fallback image
   */
  private createFallbackResponse(
    prompt: string,
    errorMessage: string
  ): ApiResponse<ImageGenerationResponse> {
    return {
      data: {
        url: this.getFallbackImage(),
        prompt,
        error: {
          code: 'FALLBACK_USED',
          message: errorMessage,
        },
        fallback: true,
      },
      status: 200,
      success: true, // We return success here since we're providing a fallback
    };
  }

  /**
   * Enhances the user prompt for better image generation results
   */
  private enhancePrompt(basePrompt: string, style: string): string {
    const stylePrompts: Record<string, string> = {
      minimalist: 'minimalist style, elegant design, clean composition',
      artistic: 'artistic, creative, expressive, vibrant colors',
      realistic: 'photorealistic, detailed, lifelike, high-definition',
      educational: 'educational, instructive, clear visualization, informative',
    };

    const styleAddition = stylePrompts[style] || stylePrompts.minimalist;

    // Add styling and quality keywords to improve generation results
    return `${basePrompt}, high quality, detailed, 4k, professional, ${styleAddition}`;
  }
}

// Create and export a singleton instance
export const fluxService = new FluxService();