"use client";

import { useState } from 'react';

/**
 * Options for the Perplexity API request
 */
export interface PerplexityOptions {
  model?: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

/**
 * Response from the Perplexity API
 */
export interface PerplexityResponse {
  text: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * A hook to interact with the Perplexity API
 */
export function usePerplexity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<PerplexityResponse | null>(null);

  /**
   * Send a prompt to the Perplexity API
   */
  const sendPrompt = async (prompt: string, options: PerplexityOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Log for debugging
      console.log('📤 Sending prompt to Perplexity API:', prompt);

      // Make the API request
      const response = await fetch('/api/perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, options }),
      });

      if (!response.ok) {
        // Try to parse the error message
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      // Parse the response
      const data = await response.json();
      console.log('📥 Received response from Perplexity API:', data);

      // Update the state with the response
      setResponse(data);
      return data;
    } catch (error) {
      // Handle the error
      console.error('❌ Error with Perplexity API:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    response,
    sendPrompt,
  };
}