/**
 * Grok Service Mock Data
 *
 * Provides fallback mock data for the Grok API when it is unavailable.
 * Used by the circuit breaker pattern to maintain functionality during API outages.
 */

export interface SuggestionItem {
  word: string;
  type: string;
  score: number;
  definition?: string;
  examples?: string[];
}

export interface SuggestionResponse {
  suggestions: SuggestionItem[];
  metadata: {
    model: string;
    requestedWord: string;
    totalResults: number;
  };
}

/**
 * Generates mock word suggestions as a fallback when the API is unavailable
 * @param word The input word to generate suggestions for
 * @returns Mock suggestion response
 */
export function mockGrokSuggestions(word: string): SuggestionResponse {
  // Common prefixes and suffixes for generating plausible related words
  const prefixes = ['re', 'un', 'in', 'dis', 'over', 'under', 'pre', 'post', 'anti'];
  const suffixes = ['ness', 'ity', 'tion', 'ing', 'ed', 'ly', 'ful', 'less', 'able', 'ible'];

  // Word types
  const types = ['synonym', 'antonym', 'related', 'derivative', 'example-usage'];

  // Generate random related words
  const suggestions: SuggestionItem[] = [];

  // Add a few synonyms
  suggestions.push({
    word: `${prefixes[Math.floor(Math.random() * prefixes.length)]}${word}`,
    type: 'synonym',
    score: 0.9,
    definition: `Similar in meaning to ${word}`,
    examples: [`The ${word} was impressive.`]
  });

  suggestions.push({
    word: `${word}${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
    type: 'derivative',
    score: 0.85,
    definition: `Derived from ${word}`,
    examples: [`They expressed great ${word}${suffixes[0]}.`]
  });

  suggestions.push({
    word: `alternative_${word}`,
    type: 'synonym',
    score: 0.8,
    definition: `Another term for ${word}`,
    examples: [`The alternative_${word} provided a new perspective.`]
  });

  suggestions.push({
    word: `opposite_${word}`,
    type: 'antonym',
    score: 0.75,
    definition: `Opposite in meaning to ${word}`,
    examples: [`While some prefer ${word}, others choose opposite_${word}.`]
  });

  suggestions.push({
    word: `${word}_concept`,
    type: 'related',
    score: 0.7,
    definition: `Conceptually related to ${word}`,
    examples: [`The ${word}_concept is fundamental to understanding this field.`]
  });

  // Include common, realistic fallback for certain words
  const commonWords: Record<string, SuggestionItem[]> = {
    'happy': [
      { word: 'joyful', type: 'synonym', score: 0.95, definition: 'Feeling or showing great pleasure or happiness', examples: ['She was joyful about the news.'] },
      { word: 'content', type: 'synonym', score: 0.9, definition: 'In a state of peaceful happiness', examples: ['He felt content with his life.'] },
      { word: 'sad', type: 'antonym', score: 0.85, definition: 'Feeling or showing sorrow', examples: ['He looked sad when he heard the bad news.'] }
    ],
    'sad': [
      { word: 'unhappy', type: 'synonym', score: 0.95, definition: 'Not happy; sorrowful', examples: ['She was unhappy with the results.'] },
      { word: 'melancholy', type: 'synonym', score: 0.9, definition: 'A feeling of pensive sadness', examples: ['There was a melancholy atmosphere at the farewell party.'] },
      { word: 'happy', type: 'antonym', score: 0.85, definition: 'Feeling or showing pleasure or contentment', examples: ["I'm happy to see you."] }
    ],
    'good': [
      { word: 'excellent', type: 'synonym', score: 0.95, definition: 'Extremely good; outstanding', examples: ['The food was excellent.'] },
      { word: 'fine', type: 'synonym', score: 0.9, definition: 'Of high quality', examples: ["That's a fine piece of craftsmanship."] },
      { word: 'bad', type: 'antonym', score: 0.85, definition: 'Not good in quality or condition', examples: ['The movie was really bad.'] }
    ],
    'bad': [
      { word: 'poor', type: 'synonym', score: 0.95, definition: 'Of low or inferior standard or quality', examples: ['The poor quality of the recording made it difficult to hear.'] },
      { word: 'awful', type: 'synonym', score: 0.9, definition: 'Very bad or unpleasant', examples: ['The weather was awful yesterday.'] },
      { word: 'good', type: 'antonym', score: 0.85, definition: 'To be desired or approved of', examples: ['The soup tastes good.'] }
    ],
    'big': [
      { word: 'large', type: 'synonym', score: 0.95, definition: 'Of considerable or relatively great size', examples: ['They have a large house.'] },
      { word: 'enormous', type: 'synonym', score: 0.9, definition: 'Very large in size or amount', examples: ['He made an enormous mistake.'] },
      { word: 'small', type: 'antonym', score: 0.85, definition: 'Of a size that is less than normal or usual', examples: ['She has small hands.'] }
    ]
  };

  // Check if we have predefined suggestions for this word
  const normalizedWord = word.toLowerCase().trim();
  if (commonWords[normalizedWord]) {
    return {
      suggestions: commonWords[normalizedWord],
      metadata: {
        model: 'offline-fallback-model',
        requestedWord: word,
        totalResults: commonWords[normalizedWord].length
      }
    };
  }

  // Return generated suggestions
  return {
    suggestions,
    metadata: {
      model: 'offline-fallback-model',
      requestedWord: word,
      totalResults: suggestions.length
    }
  };
}

/**
 * Get mock word analysis with etymology and usage examples
 * @param word The input word to analyze
 * @returns Mock word analysis
 */
export function mockWordAnalysis(word: string) {
  return {
    word,
    etymology: `[OFFLINE MOCK] The word "${word}" likely originates from the Old English language.`,
    definition: `[OFFLINE MOCK] A general term describing the concept of ${word}`,
    usageExamples: [
      `[MOCK] Many people use ${word} in everyday conversations.`,
      `[MOCK] The concept of ${word} has evolved over time.`,
      `[MOCK] Scholars have debated the meaning of ${word} for centuries.`
    ],
    relatedConcepts: [
      `${word}ology`,
      `${word} theory`,
      `${word} practice`
    ],
    offlineGenerated: true
  };
}