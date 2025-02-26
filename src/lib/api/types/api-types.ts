/**
 * API Types
 * Defines shared types and interfaces for all API services
 */

// Base API response interface
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
  success: boolean;
}

// Standard error interface
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Image generation types
export interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  enhancePrompt?: boolean;
  style?: 'realistic' | 'artistic' | 'minimalist' | 'educational';
}

export interface ImageGenerationResponse {
  url: string;
  prompt: string;
  model?: string;
  error?: ApiError;
  fallback?: boolean;
  width?: number;
  height?: number;
}

// Perplexity language API types
export interface LanguageRequest {
  query: string;
  maxTokens?: number;
  temperature?: number;
  contextItems?: string[];
}

export interface LanguageResponse {
  text: string;
  sources?: {
    title: string;
    url: string;
    snippet: string;
  }[];
  tokens: {
    total: number;
    prompt: number;
    completion: number;
  };
  model: string;
}

// Grok creative suggestions API types
export interface SuggestionRequest {
  word: string;
  count?: number;
  creativity?: number; // 0-1 scale
  includeSynonyms?: boolean;
  includeAntonyms?: boolean;
  includeRelated?: boolean;
}

export interface SuggestionResponse {
  suggestions: WordSuggestion[];
  metadata: {
    model: string;
    requestedWord: string;
    totalResults: number;
  };
}

export interface WordSuggestion {
  word: string;
  type: 'synonym' | 'antonym' | 'related' | 'rhyme' | 'creative';
  score: number;
  definition?: string;
  examples?: string[];
}

// API configuration types
export interface CircuitBreakerConfig {
  failureThreshold?: number;    // Number of failures before opening the circuit
  successThreshold?: number;    // Number of successes needed to close the circuit
  timeout?: number;             // Milliseconds to wait before testing if service has recovered
}

export interface ApiServiceConfig {
  baseUrl: string;
  apiKey?: string;
  defaultTimeout?: number;
  defaultHeaders?: Record<string, string>;
  circuitBreaker?: CircuitBreakerConfig;
  retryCount?: number;
}

// Cache configuration types
export interface CacheConfig {
  staleTime: number; // milliseconds
  cacheTime: number; // milliseconds
  retry: number;
}