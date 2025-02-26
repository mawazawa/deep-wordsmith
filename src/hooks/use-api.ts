'use client';

import { useState, useCallback } from 'react';
import useSWR, { SWRConfiguration } from 'swr';
import { SWR_CONFIG } from '@/lib/swr-config';
import { ApiResponse } from '@/lib/api/types/api-types';

/**
 * Type for the fetcherFn to ensure it returns a Promise with ApiResponse<T>
 * Using unknown instead of any for better type safety
 */
type ApiFetcherFn<T> = (...args: unknown[]) => Promise<ApiResponse<T>>;

/**
 * Type for direct data updates
 */
interface MutateOptions<T> {
  data?: T;
  error?: Error;
  revalidate?: boolean;
}

/**
 * Custom hook for API calls using SWR
 * Provides consistent error handling, loading states, and caching
 *
 * @template T - Type of data returned by the API
 * @param key - The SWR cache key (or null to disable fetching)
 * @param fetcherFn - Function that returns API data
 * @param config - SWR configuration overrides
 */
export function useApi<T = unknown>(
  key: string | null,
  fetcherFn: ApiFetcherFn<T>,
  config?: SWRConfiguration
) {
  // Track if the operation is in manual update process (e.g. during form submission)
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  // Use SWR for data fetching with configuration
  const {
    data: apiResponse,
    error: swrError,
    isLoading: swrLoading,
    isValidating,
    mutate,
  } = useSWR<ApiResponse<T>>(
    key,
    fetcherFn,
    {
      ...SWR_CONFIG, // Global defaults
      ...config,     // Component-specific overrides
    }
  );

  // Extract API data and errors
  const data = apiResponse?.data;
  const error = swrError || apiResponse?.error;

  // Create a clean isLoading state that includes both SWR loading and manual submitting
  const isLoading = swrLoading || isManualSubmitting;

  // Helper for manual mutations with loading state
  const updateData = useCallback(
    async (fn: () => Promise<ApiResponse<T>>, options?: MutateOptions<T>) => {
      try {
        setIsManualSubmitting(true);

        // If optimistic update data provided, update immediately
        if (options?.data || options?.error) {
          await mutate({
            data: options.data,
            error: options.error,
            status: options.error ? 400 : 200,
            success: !options.error,
          } as ApiResponse<T>, { revalidate: false });
        }

        // Call the update function
        const result = await fn();

        // Log for debugging
        console.log(`📝 [API] Update result:`, {
          success: result.success,
          status: result.status,
          hasData: !!result.data,
          hasError: !!result.error
        });

        // Update the cache with the result
        await mutate(result, { revalidate: options?.revalidate ?? false });

        return result;
      } catch (err) {
        // Log the error
        console.error('[API] Unhandled error in updateData:', err);

        // Create an error response
        const errorResponse: ApiResponse<T> = {
          data: undefined,
          error: {
            code: 'UNHANDLED_ERROR',
            message: err instanceof Error ? err.message : String(err),
          },
          status: 500,
          success: false,
        };

        // Update the cache with the error
        await mutate(errorResponse, { revalidate: false });

        return errorResponse;
      } finally {
        setIsManualSubmitting(false);
      }
    },
    [mutate]
  );

  // Create a function to reset the cache and force a fresh fetch
  const refresh = useCallback(() => {
    console.log(`🔄 [API] Refreshing data for key: ${key}`);
    return mutate(undefined, { revalidate: true });
  }, [mutate, key]);

  return {
    data,
    error,
    apiResponse,
    isLoading,
    isValidating,
    isSubmitting: isManualSubmitting,
    mutate,
    updateData,
    refresh,
  };
}

/**
 * Specialized hook for image generation
 * Manages the state for triggering image generation requests
 */
export function useImageGeneration(
  word: string | null,
  config?: SWRConfiguration
) {
  const [generateImage, setGenerateImage] = useState<boolean>(false);

  // Only fetch if explicitly triggered
  const key = generateImage && word ? `image-gen-${word}` : null;

  const api = useApi<{url: string; prompt: string; model: string}>(
    key,
    async () => {
      if (!word) {
        return {
          data: undefined,
          status: 400,
          success: false,
          error: { code: 'MISSING_WORD', message: 'No word provided for image generation' }
        };
      }

      console.log(`🎨 [API] Generating image for word: ${word}`);

      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: word }),
        });

        const data = await response.json();

        return {
          data,
          status: response.status,
          success: response.ok,
          error: !response.ok ?
            { code: 'API_ERROR', message: data.message || 'Failed to generate image' } :
            undefined,
        };
      } catch (error) {
        console.error('🔥 [API] Image generation error:', error);
        return {
          data: undefined,
          status: 500,
          success: false,
          error: {
            code: 'FETCH_ERROR',
            message: error instanceof Error ? error.message : 'Failed to contact image generation service'
          }
        };
      }
    },
    config
  );

  const generate = useCallback(() => {
    console.log(`🚀 [API] Triggering image generation for: ${word}`);
    setGenerateImage(true);
  }, [word]);

  return {
    ...api,
    generate,
  };
}