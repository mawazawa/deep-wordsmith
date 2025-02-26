/**
 * SWR Configuration
 * Global configuration for SWR data fetching and caching
 */
import { SWRConfiguration } from 'swr';

/**
 * Default global SWR configuration
 */
export const SWR_CONFIG: SWRConfiguration = {
  // Default interval in milliseconds to refresh data (0 = disabled)
  refreshInterval: 0,

  // Time in milliseconds after which data is considered stale
  // 5 minutes for most data
  dedupingInterval: 300000,

  // Whether to revalidate on focus (when tab becomes active)
  revalidateOnFocus: false,

  // Whether to revalidate on reconnect (when browser regains connection)
  revalidateOnReconnect: true,

  // Error retry settings
  errorRetryCount: 3,

  // Use localStorage for persistence (implemented via custom cache below)
  // This is handled automatically by SWR
};

/**
 * SWR configuration for image-related data
 * Uses more aggressive caching since images don't change often
 */
export const IMAGE_SWR_CONFIG: SWRConfiguration = {
  ...SWR_CONFIG,
  dedupingInterval: 3600000, // 1 hour
  errorRetryCount: 2,
};

/**
 * SWR configuration for language-related data
 * Uses less aggressive caching since language data can change
 */
export const LANGUAGE_SWR_CONFIG: SWRConfiguration = {
  ...SWR_CONFIG,
  dedupingInterval: 120000, // 2 minutes
  revalidateOnFocus: true,
};