/**
 * Enhanced API Service
 *
 * Extends the base API service with circuit breaker pattern for fault isolation
 * and resilience against failing services.
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError, ApiServiceConfig } from './types/api-types';
import { validateServiceEnv, ServiceKey } from '../env-validator';
import { CircuitBreaker } from '../error-handling/circuit-breaker';

export class EnhancedApiService {
  protected client: AxiosInstance;
  protected serviceName: string;
  protected config: ApiServiceConfig;
  protected isEnvironmentValid: boolean;
  protected missingEnvVars: string[];
  protected circuitBreaker: CircuitBreaker;

  constructor(serviceName: string, config: ApiServiceConfig) {
    this.serviceName = serviceName;
    this.config = config;

    // Set up circuit breaker
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: config.circuitBreaker?.failureThreshold || 3,
      successThreshold: config.circuitBreaker?.successThreshold || 2,
      timeout: config.circuitBreaker?.timeout || 30000,
      onStateChange: (from, to) => {
        console.log(`🔌 [${this.serviceName}] Circuit state changed: ${from} -> ${to}`);
      }
    });

    // Validate environment variables for this service
    const serviceKey = this.getServiceKeyFromName();
    if (serviceKey) {
      const validation = validateServiceEnv(serviceKey);
      this.isEnvironmentValid = validation.valid;
      this.missingEnvVars = validation.missing;

      if (!this.isEnvironmentValid) {
        console.warn(`⚠️ [${this.serviceName}] Missing environment variables: ${this.missingEnvVars.join(', ')}`);
      }
    } else {
      this.isEnvironmentValid = true;
      this.missingEnvVars = [];
    }

    // Create axios instance with service configuration
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.defaultTimeout || 15000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        ...config.defaultHeaders,
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use((request) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔷 [${this.serviceName}] API Request:`, {
          url: request.url,
          method: request.method,
          // Omit sensitive headers like Authorization
          headers: { ...request.headers, Authorization: '[REDACTED]' },
          // Omit sensitive data
          data: this.sanitizeLogData(request.data),
        });
      }
      return request;
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ [${this.serviceName}] API Response:`, {
            status: response.status,
            statusText: response.statusText,
            data: this.sanitizeLogData(response.data),
          });
        }
        return response;
      },
      (error: AxiosError) => {
        // Log error details
        const errorDetails = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data ? this.sanitizeLogData(error.response.data) : undefined,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        };

        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ [${this.serviceName}] API Error:`, errorDetails);
        } else {
          // In production, log without sensitive data
          console.error(`❌ [${this.serviceName}] API Error: ${error.message} (${error.response?.status || 'No status'})`);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the service key from service name for environment validation
   */
  private getServiceKeyFromName(): ServiceKey | null {
    const name = this.serviceName.toLowerCase();
    if (name.includes('flux') || name.includes('replicate')) return 'replicate';
    if (name.includes('perplexity')) return 'perplexity';
    if (name.includes('grok')) return 'grok';
    if (name.includes('anthropic') || name.includes('claude')) return 'anthropic';
    return null;
  }

  /**
   * Check if the service is configured properly with required environment variables
   */
  public isConfigured(): boolean {
    return this.isEnvironmentValid && !!this.config.apiKey;
  }

  /**
   * Get the status of the circuit breaker
   */
  public getCircuitStatus() {
    return this.circuitBreaker.getStatus();
  }

  /**
   * Manually reset the circuit breaker
   */
  public resetCircuit(): void {
    this.circuitBreaker.reset();
    console.log(`🔄 [${this.serviceName}] Circuit breaker manually reset`);
  }

  /**
   * Sanitize sensitive data before logging
   */
  private sanitizeLogData(data: any): any {
    if (!data) return data;

    // Create a copy to avoid modifying the original
    const sanitized = { ...data };

    // Redact common sensitive fields
    const sensitiveFields = ['apiKey', 'password', 'token', 'secret', 'Authorization', 'auth', 'key'];
    sensitiveFields.forEach((field) => {
      if (typeof sanitized[field] !== 'undefined') {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Process API errors into a standardized format
   */
  protected handleError(error: unknown): ApiError {
    // Handle Axios errors with detailed information
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const statusCode = axiosError.response?.status;
      const serverMessage = axiosError.response?.data?.error?.message ||
                           axiosError.response?.data?.message;

      // Map status codes to error codes
      const errorCodeMap: Record<number, string> = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        429: 'RATE_LIMITED',
        500: 'INTERNAL_SERVER_ERROR',
        502: 'BAD_GATEWAY',
        503: 'SERVICE_UNAVAILABLE',
        504: 'GATEWAY_TIMEOUT'
      };

      const errorCode = errorCodeMap[statusCode || 500] || 'API_ERROR';

      return {
        code: errorCode,
        message: serverMessage || axiosError.message || `HTTP Error ${statusCode}`,
        details: {
          status: statusCode,
          url: axiosError.config?.url,
          method: axiosError.config?.method?.toUpperCase(),
          ...(process.env.NODE_ENV === 'development' && {
            data: axiosError.config?.data,
            stack: axiosError.stack
          })
        }
      };
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      return {
        code: 'CLIENT_ERROR',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }

    // Handle unknown error types
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      details: String(error)
    };
  }

  /**
   * Makes a GET request with circuit breaker protection
   */
  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig,
    retries = 2
  ): Promise<ApiResponse<T>> {
    try {
      // Execute the request through the circuit breaker
      const response = await this.circuitBreaker.execute(async () => {
        try {
          const res = await this.client.get<T>(url, config);
          return {
            data: res.data,
            status: res.status,
            success: true,
          };
        } catch (error) {
          // Retry for specific error conditions
          if (retries > 0 && this.isRetryableError(error)) {
            console.log(`[${this.serviceName}] Retrying GET request to ${url} (${retries} attempts remaining)`);
            // Exponential backoff: wait longer for each retry
            const delay = 1000 * (3 - retries);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.get<T>(url, config, retries - 1);
          }
          throw error;
        }
      });

      return response;
    } catch (error) {
      return {
        error: this.handleError(error),
        status: this.getErrorStatus(error),
        success: false,
      };
    }
  }

  /**
   * Makes a POST request with circuit breaker protection
   */
  protected async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
    retries = 2
  ): Promise<ApiResponse<T>> {
    try {
      // Execute the request through the circuit breaker
      const response = await this.circuitBreaker.execute(async () => {
        try {
          const res = await this.client.post<T>(url, data, config);
          return {
            data: res.data,
            status: res.status,
            success: true,
          };
        } catch (error) {
          // Retry for specific error conditions
          if (retries > 0 && this.isRetryableError(error)) {
            console.log(`[${this.serviceName}] Retrying POST request to ${url} (${retries} attempts remaining)`);
            // Exponential backoff: wait longer for each retry
            const delay = 1000 * (3 - retries);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.post<T, D>(url, data, config, retries - 1);
          }
          throw error;
        }
      });

      return response;
    } catch (error) {
      return {
        error: this.handleError(error),
        status: this.getErrorStatus(error),
        success: false,
      };
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      // Network errors or specific status codes that are temporary
      if (!status || status === 429 || status === 503 || status === 504) {
        return true;
      }

      // Retry on connection errors
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
        return true;
      }
    }

    return false;
  }

  /**
   * Get HTTP status from error
   */
  private getErrorStatus(error: unknown): number {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.status;
    }

    // Default status for network errors
    return 0;
  }
}