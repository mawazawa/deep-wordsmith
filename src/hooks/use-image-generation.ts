"use client";

import { useState, useCallback } from 'react';
import { SWRConfiguration } from 'swr';
import { useApi } from './use-api';
import { fluxService } from '@/lib/api';
import { ImageGenerationRequest, ImageGenerationResponse } from '@/lib/api/types/api-types';
import { IMAGE_SWR_CONFIG } from '@/lib/swr-config';

/**
 * Enhanced hook for generating images using our API service layer
 * Provides a cached, optimized interface to the Flux service
 */
export function useImageGeneration(
  word: string | null,
  options?: Partial<ImageGenerationRequest>,
  config?: SWRConfiguration
) {
  // Only trigger the fetch when explicitly requested
  const [shouldFetch, setShouldFetch] = useState(false);

  // Create cache key with word and options for proper caching
  const key = shouldFetch && word
    ? `image-gen-${word}-${JSON.stringify(options)}`
    : null;

  // Use our API hook with the Flux service
  const api = useApi<ImageGenerationResponse>(
    key,
    async () => {
      if (!word) {
        throw new Error('No word provided for image generation');
      }

      // Prepare the request with defaults and overrides
      const request: ImageGenerationRequest = {
        prompt: word,
        width: 512,
        height: 512,
        enhancePrompt: true,
        style: 'minimalist',
        ...options,
      };

      // Call the Flux service
      return fluxService.generateImage(request);
    },
    {
      ...IMAGE_SWR_CONFIG,
      ...config,
      // Override revalidation for image generation to be conservative
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour
    }
  );

  // Function to trigger image generation
  const generateImage = useCallback(() => {
    setShouldFetch(true);
  }, []);

  // Function to reset and try again
  const reset = useCallback(() => {
    api.refresh();
  }, [api]);

  // Check if using fallback
  const isFallback = api.data?.fallback === true;

  return {
    ...api,
    generateImage,
    reset,
    isFallback,
  };
}