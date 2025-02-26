/**
 * Perplexity Language Service
 * Handles contextual language understanding with Perplexity AI
 */
import { ApiService } from './api-service';
import {
  ApiResponse,
  LanguageRequest,
  LanguageResponse
} from './types/api-types';
import { AI_CONFIG } from '@/lib/ai-config';

export class PerplexityService extends ApiService {
  private defaultModel: string;

  constructor() {
    const { apiUrl, apiKey, defaultModel } = AI_CONFIG.perplexity;

    super('PerplexityService', {
      baseUrl: apiUrl || 'https://api.perplexity.ai',
      apiKey,
      defaultTimeout: 20000,
    });

    this.defaultModel = defaultModel || 'sonar-small-online';
  }

  /**
   * Query the Perplexity API for contextual language understanding
   */
  public async query(request: LanguageRequest): Promise<ApiResponse<LanguageResponse>> {
    // Check if API key is available
    if (!this.config.apiKey) {
      console.warn('⚠️ No Perplexity API key found.');
      return {
        error: {
          code: 'PERPLEXITY_AUTH_ERROR',
          message: 'No API key provided for Perplexity AI',
        },
        status: 401,
        success: false,
      };
    }

    try {
      const response = await this.post<LanguageResponse>('/api/query', {
        query: request.query,
        model: this.defaultModel,
        max_tokens: request.maxTokens || 500,
        temperature: request.temperature || 0.7,
        context_items: request.contextItems || [],
      });

      // Enhanced logging for development
      if (process.env.NODE_ENV === 'development' && response.data) {
        console.log(`📚 Perplexity response for query "${request.query.substring(0, 30)}...":`, {
          tokens: response.data.tokens,
          model: response.data.model,
          sourceCount: response.data.sources?.length || 0,
        });
      }

      return response;
    } catch (error) {
      console.error('❌ Error in PerplexityService.query:', error);

      return {
        error: this.handleError(error),
        status: 500,
        success: false,
      };
    }
  }

  /**
   * Get sources for citations from a previous query
   */
  public async getSources(queryId: string): Promise<ApiResponse<any>> {
    if (!this.config.apiKey) {
      return {
        error: {
          code: 'PERPLEXITY_AUTH_ERROR',
          message: 'No API key provided for Perplexity AI',
        },
        status: 401,
        success: false,
      };
    }

    return this.get<any>(`/api/sources/${queryId}`);
  }
}

// Create and export a singleton instance
export const perplexityService = new PerplexityService();