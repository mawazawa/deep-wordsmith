'use client';

import { SWRConfiguration } from 'swr';
import { useApi } from './use-api';
import { perplexityService } from '@/lib/api';
import { LanguageRequest, LanguageResponse } from '@/lib/api/types/api-types';
import { LANGUAGE_SWR_CONFIG } from '@/lib/swr-config';

/**
 * Hook for contextual language queries using Perplexity API
 * Provides a cached interface to the Perplexity service
 */
export function useLanguageContext(
  query: string | null,
  options?: Partial<LanguageRequest>,
  config?: SWRConfiguration
) {
  // Only create a key if we have a query
  const key = query ? `language-context-${query}-${JSON.stringify(options)}` : null;

  // Use our custom API hook with the Perplexity service
  const api = useApi<LanguageResponse>(
    key,
    async () => {
      if (!query) {
        throw new Error('No query provided for language context');
      }

      // Prepare the request with defaults and overrides
      const request: LanguageRequest = {
        query,
        maxTokens: 300,
        temperature: 0.7,
        contextItems: [],
        ...options,
      };

      // Call the Perplexity service
      return perplexityService.query(request);
    },
    {
      ...LANGUAGE_SWR_CONFIG,
      ...config,
    }
  );

  // Extract token usage for monitoring/display
  const tokenUsage = api.data?.tokens;

  // Check if API key is available
  const isApiKeyMissing = api.error?.code === 'PERPLEXITY_AUTH_ERROR';

  // For dev/demo: fall back to mock data if API key is missing
  if (isApiKeyMissing && process.env.NODE_ENV === 'development' && query) {
    return {
      ...api,
      data: {
        text: `This is mock language data for the query: "${query}"`,
        model: 'mock-model',
        tokens: {
          total: 0,
          prompt: 0,
          completion: 0,
        },
      },
      isApiKeyMissing,
      tokenUsage: null,
    };
  }

  return {
    ...api,
    isApiKeyMissing,
    tokenUsage,
  };
}