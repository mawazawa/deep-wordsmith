/**
 * Environment Variable Utilities
 *
 * This module provides safe access to environment variables with proper typing and validation.
 */

/**
 * Get an environment variable with validation
 *
 * @param key The environment variable key
 * @param defaultValue Optional default value if not found
 * @param required Whether the environment variable is required
 * @returns The environment variable value or default
 */
export function getEnv(
  key: string,
  defaultValue?: string,
  required = false
): string | undefined {
  const value = process.env[key];

  // Log the status in development for debugging
  if (process.env.NODE_ENV === 'development') {
    if (!value) {
      console.warn(`⚠️ Environment variable ${key} not found${required ? ' (REQUIRED)' : ''}`);
    } else {
      console.log(`✅ Environment variable ${key} loaded successfully`);
    }
  }

  // If the value is required but not found, throw an error
  if (required && !value && !defaultValue) {
    throw new Error(`Required environment variable ${key} is missing`);
  }

  return value || defaultValue;
}

/**
 * Get a boolean environment variable
 *
 * @param key The environment variable key
 * @param defaultValue Default value if not found
 * @returns The boolean value
 */
export function getBoolEnv(key: string, defaultValue = false): boolean {
  const value = getEnv(key);
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Get a required environment variable
 *
 * @param key The environment variable key
 * @throws Error if the environment variable is not found
 * @returns The environment variable value
 */
export function getRequiredEnv(key: string): string {
  const value = getEnv(key, undefined, true);
  if (!value) {
    throw new Error(`Required environment variable ${key} is missing`);
  }
  return value;
}

/**
 * Get a number environment variable
 *
 * @param key The environment variable key
 * @param defaultValue Default value if not found
 * @returns The number value
 */
export function getNumberEnv(key: string, defaultValue?: number): number | undefined {
  const value = getEnv(key);
  if (value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}