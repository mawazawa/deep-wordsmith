import { getEnv } from './env';

/**
 * Environment Variable Validator
 *
 * Ensures all required environment variables are present before application startup
 */

// Define required environment variables for each AI service
export const REQUIRED_ENV_VARS = {
  // Replicate (for image generation)
  replicate: ['REPLICATE_API_TOKEN', 'REPLICATE_FLUX_MODEL'],

  // Perplexity (for contextual understanding)
  perplexity: ['PERPLEXITY_API_KEY'],

  // Grok (for creative suggestions)
  grok: ['GROK_API_KEY'],

  // Anthropic (for linguistic analysis)
  anthropic: ['ANTHROPIC_API_KEY'],
} as const;

// Define service key type
export type ServiceKey = keyof typeof REQUIRED_ENV_VARS;

// Check if a specific service's environment variables are present
export function validateServiceEnv(service: ServiceKey): {
  valid: boolean;
  missing: string[];
  serviceName: string;
} {
  const requiredVars = REQUIRED_ENV_VARS[service];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  return {
    valid: missing.length === 0,
    missing,
    serviceName: service,
  };
}

// Validate all environment variables or a specific set
export function validateEnv(services?: ServiceKey[]): {
  valid: boolean;
  missing: Record<string, string[]>;
} {
  const servicesToValidate = services || Object.keys(REQUIRED_ENV_VARS) as ServiceKey[];

  const result: Record<string, string[]> = {};
  let valid = true;

  for (const service of servicesToValidate) {
    const validation = validateServiceEnv(service);
    if (!validation.valid) {
      valid = false;
      result[service] = validation.missing;
    }
  }

  // Log validation results in development
  if (process.env.NODE_ENV === 'development' && !valid) {
    console.error('❌ Missing required environment variables:');
    Object.entries(result).forEach(([service, vars]) => {
      console.error(`  - ${service}: ${vars.join(', ')}`);
    });
    console.error('Please add these variables to your .env.local file');
  }

  return {
    valid,
    missing: result,
  };
}

// Validate all environment variables and throw if in production
export function validateEnvOrThrow(throwInProduction = true): void {
  const { valid, missing } = validateEnv();

  if (!valid && (process.env.NODE_ENV === 'production' && throwInProduction)) {
    throw new Error(
      `Missing required environment variables: ${JSON.stringify(missing)}`
    );
  }
}

/**
 * Environment Validator Utility
 *
 * Validates that all required environment variables are present
 * and logs warnings for missing variables.
 */

// List of API keys that should be present (but can be missing in development)
const API_KEYS = [
  'REPLICATE_API_TOKEN',
  'PERPLEXITY_API_KEY',
  'GROK_API_KEY',
  'ANTHROPIC_API_KEY',
];

// List of absolutely required environment variables (will throw error if missing)
const REQUIRED_VARS = [
  'NEXT_PUBLIC_APP_URL',
];

/**
 * Validates that all required environment variables are present
 * @param strict Whether to throw errors for missing API keys (default: false)
 */
export function validateEnvironment(strict = false): void {
  // Check required environment variables
  REQUIRED_VARS.forEach(key => {
    try {
      const value = getEnv(key, undefined, true);
      if (!value) {
        throw new Error(`Required environment variable ${key} is missing`);
      }
    } catch (error) {
      console.error(`❌ ${error}`);
      throw error;
    }
  });

  // Check API keys
  const missingApiKeys = API_KEYS.filter(key => !process.env[key]);

  if (missingApiKeys.length > 0) {
    console.warn(`⚠️ Missing the following API keys: ${missingApiKeys.join(', ')}`);

    if (process.env.NODE_ENV === 'production' && strict) {
      throw new Error(
        `Missing required API keys in production: ${missingApiKeys.join(', ')}`
      );
    }
  } else {
    console.log('✅ All API keys are configured');
  }
}

/**
 * Validate environment variables at runtime
 * but don't throw errors in development mode
 */
export function validateRuntimeEnvironment(): void {
  try {
    validateEnvironment(process.env.NODE_ENV === 'production');
  } catch (error) {
    // In development, just log the error
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Environment validation failed: ${error}`);
      return;
    }

    // In production, rethrow the error
    throw error;
  }
}