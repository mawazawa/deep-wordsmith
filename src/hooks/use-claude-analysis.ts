'use client';

import { SWRConfiguration } from 'swr';
import { useApi } from './use-api';
import { anthropicService } from '@/lib/api';
import { LANGUAGE_SWR_CONFIG } from '@/lib/swr-config';

/**
 * Type for the linguistic analysis response
 */
interface LinguisticAnalysis {
  etymology: {
    origin: string;
    history: string;
    derivation?: string;
  };
  semantics: {
    meaning: string;
    nuances: string[];
    domains?: string[];
  };
  usage: {
    common_phrases: string[];
    collocations: string[];
    examples: string[];
  };
  related: {
    synonyms: string[];
    antonyms: string[];
    conceptual: string[];
  };
  register: {
    formality: string;
    connotation: string;
    contexts: string[];
  };
  model: string;
  tokens: {
    total: number;
    prompt: number;
    completion: number;
  };
}

/**
 * Custom hook for advanced linguistic analysis using Claude
 * This hook caches results and provides a clean interface to the Anthropic service
 */
export function useClaudeAnalysis(
  word: string | null,
  config?: SWRConfiguration
) {
  // Only create a key if we have a word
  const key = word ? `claude-analysis-${word}` : null;

  // Use our API hook with the Anthropic service
  const api = useApi<LinguisticAnalysis>(
    key,
    async () => {
      if (!word) {
        throw new Error('No word provided for linguistic analysis');
      }

      // Create a detailed prompt for linguistic analysis
      const prompt = `Analyze the word "${word}" in depth, considering its etymology, semantics, usage patterns, and related concepts.`;

      // Call the Anthropic service
      return anthropicService.analyzeLanguage(prompt);
    },
    {
      ...LANGUAGE_SWR_CONFIG,
      ...config,
      // Increase dedupingInterval since linguistic analyses don't change often
      dedupingInterval: 3600000, // 1 hour
    }
  );

  // Check if API key is missing
  const isApiKeyMissing = api.error?.code === 'ANTHROPIC_AUTH_ERROR';

  // For dev/demo: fall back to mock data if API key is missing
  if (isApiKeyMissing && process.env.NODE_ENV === 'development' && word) {
    return {
      ...api,
      data: getMockAnalysis(word),
      isApiKeyMissing,
    };
  }

  return {
    ...api,
    isApiKeyMissing,
  };
}

/**
 * Generate mock linguistic analysis for development and testing
 */
function getMockAnalysis(word: string): LinguisticAnalysis {
  return {
    etymology: {
      origin: "Mock Latin origin",
      history: `Mock historical development of the word "${word}"`,
      derivation: "Mock word derivation",
    },
    semantics: {
      meaning: `Primary meaning of "${word}"`,
      nuances: ["Mock nuance 1", "Mock nuance 2", "Mock nuance 3"],
      domains: ["General", "Academic"],
    },
    usage: {
      common_phrases: [`${word} and related term`, `Another common use of ${word}`],
      collocations: [`adjective ${word}`, `${word} noun`],
      examples: [
        `Here is an example sentence using "${word}".`,
        `Another example of "${word}" in context.`,
      ],
    },
    related: {
      synonyms: ["mock-synonym-1", "mock-synonym-2"],
      antonyms: ["mock-antonym-1", "mock-antonym-2"],
      conceptual: ["mock-related-1", "mock-related-2"],
    },
    register: {
      formality: "Neutral to formal",
      connotation: "Neutral",
      contexts: ["Academic", "Literary", "Everyday"],
    },
    model: "mock-claude-model",
    tokens: {
      total: 0,
      prompt: 0,
      completion: 0,
    },
  };
}