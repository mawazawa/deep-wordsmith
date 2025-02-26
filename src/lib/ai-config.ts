/**
 * AI Service Configuration
 * Contains settings for various AI providers used in Deep Words
 */
import { getEnv, getBoolEnv } from './env';

// Configuration for various AI providers
export const AI_CONFIG = {
  replicate: {
    apiToken: getEnv('REPLICATE_API_TOKEN'),
    fluxModel: getEnv('REPLICATE_FLUX_MODEL', 'black-forest-labs/flux-1.1-pro'),
    // Add fallback options
    fallback: {
      enabled: getBoolEnv('ENABLE_FALLBACK_IMAGES', true),
      localImages: [
        '/fallback/language-1.svg',
        '/fallback/language-2.svg',
        '/fallback/language-3.svg',
      ],
      placeholderUrl: '/fallback/image-placeholder.svg',
    },
  },
  perplexity: {
    apiUrl: getEnv('PERPLEXITY_API_URL', 'https://api.perplexity.ai'),
    apiKey: getEnv('PERPLEXITY_API_KEY'),
    defaultModel: 'sonar-small-online',
  },
  grok: {
    apiUrl: getEnv('GROK_API_URL', 'https://api.grok.ai'),
    apiKey: getEnv('GROK_API_KEY'),
    defaultModel: 'grok-1',
  },
  anthropic: {
    apiUrl: getEnv('ANTHROPIC_API_URL', 'https://api.anthropic.com'),
    apiKey: getEnv('ANTHROPIC_API_KEY'),
    defaultModel: getEnv('ANTHROPIC_MODEL', 'claude-3-7-sonnet'),
  },
};

// Log debug information in development
if (process.env.NODE_ENV === 'development') {
  console.log('AI Configuration initialized with providers:',
    Object.keys(AI_CONFIG).filter(key => {
      const config = AI_CONFIG[key as keyof typeof AI_CONFIG];
      // Check for either apiKey or apiToken, depending on the service
      return (config as any).apiKey !== undefined || (config as any).apiToken !== undefined;
    })
  );
}

// Type for response from image generation
export interface ImageGenerationResponse {
  url: string;
  prompt: string;
  model?: string;
  error?: any;
  fallback?: boolean;
}

// Create types for use elsewhere in the application
export type AIConfigType = typeof AI_CONFIG;