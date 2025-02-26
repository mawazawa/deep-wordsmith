'use client';

import { useCallback } from 'react';
import { SWRConfiguration } from 'swr';
import { useApi } from './use-api';
import { grokService } from '@/lib/api';
import { SuggestionRequest, SuggestionResponse } from '@/lib/api/types/api-types';
import { LANGUAGE_SWR_CONFIG } from '@/lib/swr-config';

/**
 * Hook for word suggestions using Grok API
 * Provides a cached, optimized interface to the Grok service
 */
export function useWordSuggestions(
  word: string | null,
  options?: Partial<SuggestionRequest>,
  config?: SWRConfiguration
) {
  // Only create a key if we have a word
  const key = word ? `word-suggestions-${word}-${JSON.stringify(options)}` : null;

  // Use our custom API hook with the Grok service
  const api = useApi<SuggestionResponse>(
    key,
    async () => {
      if (!word) {
        throw new Error('No word provided for suggestions');
      }

      // Prepare the request with defaults and overrides
      const request: SuggestionRequest = {
        word,
        count: 10,
        creativity: 0.7,
        includeSynonyms: true,
        includeAntonyms: true,
        includeRelated: true,
        ...options,
      };

      // Call the Grok service
      return grokService.getSuggestions(request);
    },
    {
      ...LANGUAGE_SWR_CONFIG,
      ...config,
    }
  );

  // Convenience method to get suggestions by type
  const getSuggestionsByType = useCallback((type: string) => {
    if (!api.data?.suggestions) return [];
    return api.data.suggestions.filter(s => s.type === type);
  }, [api.data]);

  // Convenience methods for specific types
  const synonyms = getSuggestionsByType('synonym');
  const antonyms = getSuggestionsByType('antonym');
  const related = getSuggestionsByType('related');
  const creative = getSuggestionsByType('creative');

  // Check if API key is available
  const isApiKeyMissing = api.error?.code === 'GROK_AUTH_ERROR';

  // For dev/demo: fall back to mock data if API key is missing
  if (isApiKeyMissing && process.env.NODE_ENV === 'development' && word) {
    return {
      ...api,
      data: grokService.getMockSuggestions(word),
      isApiKeyMissing,
      synonyms: [], // Add mock data by type
      antonyms: [],
      related: [],
      creative: [],
    };
  }

  return {
    ...api,
    isApiKeyMissing,
    getSuggestionsByType,
    synonyms,
    antonyms,
    related,
    creative,
  };
}