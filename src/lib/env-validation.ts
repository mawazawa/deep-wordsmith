/**
 * Environment Variable Validation
 *
 * Advanced validation for environment variables using zod schema validation.
 * Ensures that required variables are present and properly formatted before
 * application startup.
 */

import { z } from 'zod';

// Define schema for environment variables
const envSchema = z.object({
  // Core app settings
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // API keys with format validation where possible
  REPLICATE_API_TOKEN: z.string().min(1, "Replicate API Token is required"),
  REPLICATE_FLUX_MODEL: z.string().min(1, "Replicate Flux Model ID is required"),

  PERPLEXITY_API_KEY: z.string().min(1, "Perplexity API Key is required"),

  GROK_API_KEY: z.string().min(1, "Grok API Key is required"),

  ANTHROPIC_API_KEY: z.string()
    .min(1, "Anthropic API Key is required")
    .regex(/^sk-ant-/, "Anthropic API Key must start with sk-ant-"),

  // Optional settings with defaults
  API_TIMEOUT_MS: z.coerce.number().positive().default(30000),
  DEBUG_LOGGING: z.enum(['true', 'false']).default('false'),
});

// Define the environment type based on the schema
export type Env = z.infer<typeof envSchema>;

/**
 * Validate all environment variables against the schema
 * @param exitOnFailure Whether to exit the process on validation failure
 * @returns Validated environment variables object
 */
export function validateEnv(exitOnFailure = false): Env {
  try {
    // Parse environment variables with the schema
    const env = envSchema.parse(process.env);
    console.log('✅ Environment validation successful');
    return env;
  } catch (error) {
    console.error('❌ Environment validation failed:');

    if (error instanceof z.ZodError) {
      const issues = error.errors.map(issue => {
        const path = issue.path.join('.');
        return `  - ${path}: ${issue.message}`;
      }).join('\n');

      console.error(issues);

      if (exitOnFailure && process.env.NODE_ENV === 'production') {
        console.error('Exiting process due to missing required environment variables');
        process.exit(1);
      }
    } else {
      console.error('  Unknown validation error:', error);
    }

    // Return a partial environment with just the NODE_ENV for minimal operation
    // This allows the app to run in development mode with missing variables
    if (process.env.NODE_ENV !== 'production') {
      return {
        NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development',
        API_TIMEOUT_MS: 30000,
        DEBUG_LOGGING: 'false',
      } as Env;
    }

    throw error;
  }
}

/**
 * Validate a specific service's environment variables
 * @param service The service to validate
 * @returns Whether all required variables for the service are present
 */
export function validateServiceEnv(service: 'replicate' | 'perplexity' | 'grok' | 'anthropic'): boolean {
  try {
    const partialSchema = {
      replicate: z.object({
        REPLICATE_API_TOKEN: envSchema.shape.REPLICATE_API_TOKEN,
        REPLICATE_FLUX_MODEL: envSchema.shape.REPLICATE_FLUX_MODEL,
      }),
      perplexity: z.object({
        PERPLEXITY_API_KEY: envSchema.shape.PERPLEXITY_API_KEY,
      }),
      grok: z.object({
        GROK_API_KEY: envSchema.shape.GROK_API_KEY,
      }),
      anthropic: z.object({
        ANTHROPIC_API_KEY: envSchema.shape.ANTHROPIC_API_KEY,
      }),
    };

    // Validate just the service-specific variables
    partialSchema[service].parse(process.env);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.'));
      console.warn(`⚠️ Service "${service}" has missing environment variables:`, missingVars);
    }
    return false;
  }
}

/**
 * Initialize environment validation on application startup
 * In production, this will exit the process if required variables are missing
 */
export function initializeEnvValidation(): void {
  const shouldExitOnFailure = process.env.NODE_ENV === 'production';
  validateEnv(shouldExitOnFailure);
}