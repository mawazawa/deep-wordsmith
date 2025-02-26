/**
 * Anthropic Claude Service
 * Handles advanced language understanding with Claude 3.7 Sonnet model
 */
import { ApiService } from './api-service';
import {
  ApiResponse,
  LanguageRequest,
  LanguageResponse
} from './types/api-types';
import { AI_CONFIG } from '@/lib/ai-config';

export class AnthropicService extends ApiService {
  private defaultModel: string;

  constructor() {
    // Get configuration from AI_CONFIG
    const { apiUrl, apiKey, defaultModel } = AI_CONFIG.anthropic || {};

    super('AnthropicService', {
      baseUrl: apiUrl || 'https://api.anthropic.com',
      apiKey,
      defaultHeaders: {
        'anthropic-version': '2023-06-01', // Use the latest API version
        'Content-Type': 'application/json',
      },
      defaultTimeout: 30000, // Claude can take longer for complex queries
    });

    this.defaultModel = defaultModel || 'claude-3-7-sonnet';
  }

  /**
   * Send a query to Claude for advanced language understanding
   */
  public async query(request: LanguageRequest): Promise<ApiResponse<LanguageResponse>> {
    // Check if API key is available
    if (!this.config.apiKey) {
      console.warn('⚠️ No Anthropic API key found.');
      return {
        error: {
          code: 'ANTHROPIC_AUTH_ERROR',
          message: 'No API key provided for Anthropic Claude',
        },
        status: 401,
        success: false,
      };
    }

    try {
      // Format request for Claude API
      const claudeRequest = {
        model: this.defaultModel,
        messages: [
          { role: 'user', content: request.query }
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.5,
        system: "You are Claude, a highly sophisticated AI language model specialized in providing detailed linguistic analysis, deep contextual understanding, and precise semantic exploration. Craft thorough, educational responses that help users understand language nuances."
      };

      // Call Claude API with proper endpoint
      const response = await this.post<any>('/v1/messages', claudeRequest);

      // Enhanced logging for development
      if (process.env.NODE_ENV === 'development' && response.data) {
        console.log(`🧠 Claude response for query "${request.query.substring(0, 30)}...":`, {
          model: response.data.model,
          usage: response.data.usage,
        });
      }

      // Transform Claude response format to our standard LanguageResponse
      if (response.success && response.data) {
        const claudeResponse = response.data;

        return {
          data: {
            text: claudeResponse.content?.[0]?.text || '',
            model: claudeResponse.model,
            tokens: {
              total: claudeResponse.usage?.input_tokens + claudeResponse.usage?.output_tokens,
              prompt: claudeResponse.usage?.input_tokens,
              completion: claudeResponse.usage?.output_tokens,
            },
          },
          status: response.status,
          success: true,
        };
      }

      return response as ApiResponse<LanguageResponse>;
    } catch (error) {
      console.error('❌ Error in AnthropicService.query:', error);

      return {
        error: this.handleError(error),
        status: 500,
        success: false,
      };
    }
  }

  /**
   * Generate detailed linguistic analysis for a word or phrase
   */
  public async analyzeLanguage(text: string): Promise<ApiResponse<any>> {
    if (!this.config.apiKey) {
      return {
        error: {
          code: 'ANTHROPIC_AUTH_ERROR',
          message: 'No API key provided for Anthropic Claude',
        },
        status: 401,
        success: false,
      };
    }

    const systemPrompt = `
    Analyze the provided word or phrase and provide detailed linguistic information including:
    1. Etymology and historical context
    2. Semantic analysis
    3. Common collocations and usage patterns
    4. Related concepts and semantic associations
    5. Register and connotation information

    Format your response as structured JSON with the following sections:
    - etymology
    - semantics
    - usage
    - related
    - register
    `;

    try {
      // Format request for Claude API with our analytical system prompt
      const claudeRequest = {
        model: this.defaultModel,
        messages: [
          { role: 'user', content: text }
        ],
        max_tokens: 2000,
        temperature: 0.2, // Lower temperature for more factual/analytical responses
        system: systemPrompt,
        response_format: { type: "json_object" }
      };

      // Call Claude API
      const response = await this.post<any>('/v1/messages', claudeRequest);

      // Parse JSON response if successful
      if (response.success && response.data && response.data.content) {
        try {
          const content = response.data.content[0]?.text || '{}';
          const parsedAnalysis = JSON.parse(content);

          return {
            data: {
              ...parsedAnalysis,
              model: response.data.model,
              tokens: {
                total: response.data.usage?.input_tokens + response.data.usage?.output_tokens,
                prompt: response.data.usage?.input_tokens,
                completion: response.data.usage?.output_tokens,
              },
            },
            status: response.status,
            success: true,
          };
        } catch (parseError) {
          console.error('❌ Error parsing JSON from Claude:', parseError);
          return {
            error: {
              code: 'PARSE_ERROR',
              message: 'Failed to parse Claude response as JSON',
              details: parseError instanceof Error ? parseError.message : String(parseError),
            },
            status: 500,
            success: false,
          };
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Error in AnthropicService.analyzeLanguage:', error);

      return {
        error: this.handleError(error),
        status: 500,
        success: false,
      };
    }
  }
}

// Create and export a singleton instance
export const anthropicService = new AnthropicService();