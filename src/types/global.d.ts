/**
 * Global type declarations for the application
 */

// Google Analytics gtag function
interface Window {
  gtag?: (
    command: 'event' | 'config' | 'consent' | 'set',
    action: string,
    options?: Record<string, any>
  ) => void;

  // Add other global libraries as needed
  Sentry?: {
    captureException: (error: Error) => void;
    captureMessage: (message: string) => void;
  };
}

// Extend process.env with our environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
    NEXT_PUBLIC_ENABLE_ANALYTICS?: string;

    // API Keys (for development type checking)
    REPLICATE_API_TOKEN?: string;
    REPLICATE_FLUX_MODEL?: string;
    PERPLEXITY_API_KEY?: string;
    GROK_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
  }
}