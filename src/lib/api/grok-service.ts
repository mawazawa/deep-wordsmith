/**
 * Grok Creative Suggestions Service
 * Handles AI-powered creative word suggestions and relationships
 */
import { ApiService } from './api-service';
import {
  ApiResponse,
  SuggestionRequest,
  SuggestionResponse,
  WordSuggestion
} from './types/api-types';
import { AI_CONFIG } from '@/lib/ai-config';

export class GrokService extends ApiService {
  private defaultModel: string;

  constructor() {
    const { apiUrl, apiKey, defaultModel } = AI_CONFIG.grok;

    super('GrokService', {
      baseUrl: apiUrl || 'https://api.grok.ai',
      apiKey,
      defaultTimeout: 15000,
    });

    this.defaultModel = defaultModel || 'grok-1';
  }

  /**
   * Get creative word suggestions based on input word
   */
  public async getSuggestions(request: SuggestionRequest): Promise<ApiResponse<SuggestionResponse>> {
    // Check if API key is available
    if (!this.config.apiKey) {
      console.warn('⚠️ No Grok API key found.');
      return {
        error: {
          code: 'GROK_AUTH_ERROR',
          message: 'No API key provided for Grok AI',
        },
        status: 401,
        success: false,
      };
    }

    try {
      // Format the request
      const requestData = {
        word: request.word,
        count: request.count || 10,
        creativity: request.creativity || 0.7,
        include_synonyms: request.includeSynonyms !== false,
        include_antonyms: request.includeAntonyms !== false,
        include_related: request.includeRelated !== false,
        model: this.defaultModel,
      };

      // Call Grok API
      const response = await this.post<SuggestionResponse>('/api/suggestions', requestData);

      // Enhanced logging for development
      if (process.env.NODE_ENV === 'development' && response.data) {
        console.log(`🔮 Grok suggestion response for word "${request.word}":`, {
          suggestionCount: response.data.suggestions?.length || 0,
          model: response.data.metadata?.model,
        });
      }

      return response;
    } catch (error) {
      console.error('❌ Error in GrokService.getSuggestions:', error);

      return {
        error: this.handleError(error),
        status: 500,
        success: false,
      };
    }
  }

  /**
   * Get in-depth information about a specific word
   */
  public async getWordInfo(word: string): Promise<ApiResponse<any>> {
    if (!this.config.apiKey) {
      return {
        error: {
          code: 'GROK_AUTH_ERROR',
          message: 'No API key provided for Grok AI',
        },
        status: 401,
        success: false,
      };
    }

    return this.get<any>(`/api/wordinfo/${encodeURIComponent(word)}`);
  }

  /**
   * Generate mock suggestions when API is unavailable (for development and testing)
   */
  public getMockSuggestions(word: string): SuggestionResponse {
    const mockTypes: Array<WordSuggestion['type']> = ['synonym', 'antonym', 'related', 'rhyme', 'creative'];

    // Generate 10 mock suggestions
    const suggestions: WordSuggestion[] = Array.from({ length: 10 }, (_, i) => {
      const type = mockTypes[Math.floor(Math.random() * mockTypes.length)];
      return {
        word: `${word}-${type}-${i + 1}`,
        type,
        score: Math.random(),
        definition: `This is a mock definition for ${word}-${i + 1}`,
        examples: [`Example usage of ${word}-${i + 1}`],
      };
    });

    return {
      suggestions,
      metadata: {
        model: 'mock-model',
        requestedWord: word,
        totalResults: suggestions.length,
      },
    };
  }
}

// Create and export a singleton instance
export const grokService = new GrokService();