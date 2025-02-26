"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { usePerplexity } from '@/hooks/usePerplexity';
import { Spinner } from './loaders/spinner';
import { WordLoading } from './loaders/WordLoading';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { DeepWordsLogo } from './ui/deep-words-logo';

// Define types for the word data response
interface WordData {
  word: string;
  meaning: string;
  etymology: string;
  examples: string[];
  relatedWords: {
    word: string;
    relation: string;
  }[];
}

// Define the animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

// Error fallback component
const ErrorFallback = ({ error, resetError }: { error: string, resetError: () => void }) => (
  <div className="glass-effect p-6 rounded-xl">
    <div className="text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

// This prompt is designed to get structured data back from the Perplexity API
const WORD_EXPLORATION_PROMPT = `
Analyze the following word and provide a detailed breakdown in JSON format:
WORD: "{{word}}"

Return ONLY valid JSON with the following structure:
{
  "word": "the word",
  "meaning": "detailed meaning and definition",
  "etymology": "origin and history of the word",
  "examples": ["example sentence 1", "example sentence 2"],
  "relatedWords": [
    {"word": "related word 1", "relation": "synonym/antonym/etc"},
    {"word": "related word 2", "relation": "synonym/antonym/etc"}
  ]
}
`;

// Color palette for generating background gradients
const colorPalettes = [
  ['#f9a8d4', '#c084fc'], // Pink to Purple
  ['#93c5fd', '#818cf8'], // Light Blue to Indigo
  ['#6ee7b7', '#3b82f6'], // Emerald to Blue
  ['#fde68a', '#f97316'], // Amber to Orange
  ['#d8b4fe', '#ec4899'], // Lavender to Pink
];

export function WordExplorer() {
  const [word, setWord] = useState('');
  const [searchedWord, setSearchedWord] = useState('');
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [colorPalette, setColorPalette] = useState<string[]>(colorPalettes[0]);
  const animatingDiv = useRef<HTMLDivElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { loading, error, sendPrompt } = usePerplexity();
  const [componentError, setComponentError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate a new color palette when a new word is searched
  useEffect(() => {
    if (searchedWord) {
      const randomIndex = Math.floor(Math.random() * colorPalettes.length);
      setColorPalette(colorPalettes[randomIndex]);
    }
  }, [searchedWord]);

  // Reset error state
  const resetError = () => {
    setComponentError(null);
  };

  // Mark component as loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle text-to-speech
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in your browser');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);

    toast.success('Speaking text...');
  };

  // Handle copying text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy text'));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    // Track this search in recent searches
    if (!recentSearches.includes(word.trim())) {
      setRecentSearches(prev => [word.trim(), ...prev].slice(0, 5));
    }

    try {
      await exploreWord(word.trim());
    } catch (err) {
      setComponentError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Error exploring word:', err);
    }
  };

  // Function to explore a word
  const exploreWord = async (wordToExplore: string) => {
    setComponentError(null);
    setWordData(null);

    // Generate a unique loading ID to track this specific request
    const requestId = Date.now().toString();
    setLoadingId(requestId);

    // Update the searched word
    setSearchedWord(wordToExplore);

    // Create prompt for Perplexity API
    const prompt = WORD_EXPLORATION_PROMPT.replace('{{word}}', wordToExplore);

    try {
      // Send the prompt to Perplexity API
      const response = await sendPrompt(prompt, {
        model: 'pplx-70b-online',
        systemPrompt: 'You are a precise linguistics expert. Provide accurate word information in JSON format only.',
        temperature: 0.2
      });

      // Check if this is still the active request
      if (loadingId !== requestId) return;

      // Log the result for debugging
      console.log('Perplexity response:', response);

      // Parse the response
      if (response && !response.error) {
        try {
          // Extract the JSON from the text response
          // The API might return text with JSON embedded, so we need to extract it
          const resultText = response.text || '';
          const jsonMatch = resultText.match(/\{[\s\S]*\}/);

          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            setWordData(parsedData);

            // Add a small animation to the results container
            if (animatingDiv.current) {
              animatingDiv.current.classList.add('animate-pulse');
              setTimeout(() => {
                if (animatingDiv.current) {
                  animatingDiv.current.classList.remove('animate-pulse');
                }
              }, 1000);
            }

            setLoadingId(null);
          }
        } catch (err) {
          console.error('Error parsing response:', err);
          toast.error('Error processing the word data');
          setLoadingId(null);
        }
      } else {
        toast.error('Could not retrieve word information');
        setLoadingId(null);
      }
    } catch (error) {
      console.error('Error fetching word data:', error);
      toast.error('Failed to fetch word information');
      setLoadingId(null);
    }
  };

  // Handle clicking on a related word
  const handleRelatedWordClick = useCallback((relatedWord: string) => {
    setWord(relatedWord);
    exploreWord(relatedWord);
  }, []);

  // Get relationship color
  const getRelationColor = (relation: string) => {
    const relationLower = relation.toLowerCase();
    if (relationLower.includes('synonym')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900';
    if (relationLower.includes('antonym')) return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-900';
    if (relationLower.includes('related')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900';
    return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  };

  // Show loading screen until initial component setup is complete
  if (!initialLoadComplete) {
    return (
      <div className="glass-effect p-8 rounded-xl flex flex-col items-center justify-center text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Initializing Word Explorer...</p>
      </div>
    );
  }

  // Show error fallback if there's an error
  if (componentError) {
    return <ErrorFallback error={componentError} resetError={resetError} />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-screen-lg mx-auto px-4 py-6 md:py-10 min-h-[80vh]">
      {/* Logo and Header */}
      <div className="text-center mb-10 animate-fade-in max-w-2xl">
        <div className="flex justify-center mb-4">
          <DeepWordsLogo />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Discover language
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore words through an AI-powered visual lens
        </p>
      </div>

      {/* Search Form */}
      <div className="w-full max-w-2xl mb-8">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`glass-effect transition-all ${isInputFocused ? 'ring-2 ring-primary/50' : ''}`}>
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Enter a word to explore..."
                className="flex-1 p-4 bg-transparent border-none focus:outline-none focus:ring-0 text-foreground"
                disabled={loading}
              />
              {word && (
                <button
                  type="button"
                  onClick={() => setWord('')}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear input"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="p-4 text-primary-foreground bg-primary rounded-r-md hover:bg-primary/90 transition-colors"
                disabled={loading || !word.trim()}
              >
                {loading ? <Spinner size="sm" /> : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Recent searches and examples */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {recentSearches.length > 0 && (
              <>
                <span className="text-xs text-muted-foreground">Recent:</span>
                {recentSearches.map((recentWord) => (
                  <button
                    key={recentWord}
                    onClick={() => {
                      setWord(recentWord);
                      exploreWord(recentWord);
                    }}
                    className="text-xs px-2 py-1 rounded-md bg-background/80 hover:bg-background border border-border hover:border-primary/30 transition-colors"
                  >
                    {recentWord}
                  </button>
                ))}
              </>
            )}
            {recentSearches.length === 0 && (
              <>
                <span className="text-xs text-muted-foreground">Try:</span>
                {["eloquent", "vibrant", "serendipity"].map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setWord(example);
                      exploreWord(example);
                    }}
                    className="text-xs px-2 py-1 rounded-md bg-background/80 hover:bg-background border border-border hover:border-primary/30 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </>
            )}
          </div>
        </form>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <WordLoading />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl p-6 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 mb-8"
          >
            <h3 className="font-bold mb-2">Error</h3>
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {wordData && !loading && (
          <motion.div
            ref={animatingDiv}
            className="w-full max-w-3xl"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="glass-effect p-8 rounded-2xl shadow-sm border border-border/60 relative overflow-hidden">
              {/* Generative gradient background - subtle and elegant */}
              <div
                className="absolute inset-0 opacity-5 -z-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 30% 20%, ${colorPalette[0]} 0%, transparent 50%),
                                    radial-gradient(circle at 70% 80%, ${colorPalette[1]} 0%, transparent 50%)`
                }}
              />

              <motion.div variants={itemVariants} className="border-b pb-4 mb-6 flex justify-between items-center">
                <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  {wordData.word}
                </h1>

                <div className="flex gap-2">
                  <button
                    onClick={() => speak(`${wordData.word}. ${wordData.meaning}`)}
                    className="p-2 rounded-full hover:bg-background/80 transition-colors"
                    aria-label="Listen to pronunciation"
                    title="Listen to pronunciation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => copyToClipboard(wordData.word)}
                    className="p-2 rounded-full hover:bg-background/80 transition-colors"
                    aria-label="Copy word to clipboard"
                    title="Copy word to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </motion.div>

              {/* Meaning */}
              <motion.div variants={itemVariants} className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Meaning
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{wordData.meaning}</p>
              </motion.div>

              {/* Etymology */}
              <motion.div variants={itemVariants} className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Etymology
                </h3>
                <div className="text-muted-foreground leading-relaxed p-4 border border-border/60 rounded-lg bg-background/30">
                  {wordData.etymology}
                </div>
              </motion.div>

              {/* Examples */}
              {wordData.examples && wordData.examples.length > 0 && (
                <motion.div variants={itemVariants} className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Examples
                  </h3>
                  <ul className="list-none space-y-2">
                    {wordData.examples.map((example, i) => (
                      <li key={i} className="p-4 rounded-lg bg-background/40 border border-border/60 text-muted-foreground italic relative overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            background: `linear-gradient(120deg, ${colorPalette[0]}20, ${colorPalette[1]}20)`,
                          }}
                        />
                        <div className="relative z-10">"{example}"</div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Related Words */}
              {wordData.relatedWords && wordData.relatedWords.length > 0 && (
                <motion.div variants={itemVariants}>
                  <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Related Words
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {wordData.relatedWords.map((related, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleRelatedWordClick(related.word)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`px-3 py-2 rounded-lg border transition-all
                                  hover:shadow-md cursor-pointer ${getRelationColor(related.relation)}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{related.word}</span>
                          <span className="text-xs opacity-80">({related.relation})</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Export and share options */}
            {wordData && (
              <motion.div
                variants={itemVariants}
                className="mt-4 flex justify-center gap-3"
              >
                <button
                  onClick={() => copyToClipboard(`${wordData.word} - ${wordData.meaning}`)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border/60 hover:border-border bg-background/50 hover:bg-background"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy definition
                </button>
                <button
                  onClick={() => {
                    const text = `I just discovered the word "${wordData.word}" using Deep Words!\n\n${wordData.meaning}\n\nExplore more at deepwords.ai`;
                    copyToClipboard(text);
                    toast.success('Shareable text copied to clipboard');
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border/60 hover:border-border bg-background/50 hover:bg-background"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features section - only shows when no word is being displayed */}
      {!wordData && !loading && (
        <div className="w-full max-w-3xl mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-effect p-6 rounded-xl flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 10L12.2581 12.4436C12.6766 12.7574 13.2584 12.7103 13.6203 12.3346L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">AI-Powered Context</h3>
              <p className="text-sm text-muted-foreground">
                Understand words deeply with AI-generated meanings, etymology, and nuanced context.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-effect p-6 rounded-xl flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 19l-4-4m0 0l4-4m-4 4h14m-5 4v-4m0 0V7m0 4h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Semantic Networks</h3>
              <p className="text-sm text-muted-foreground">
                Discover connections between words through intelligent semantic relationships and associations.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-effect p-6 rounded-xl flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Visual Mnemonics</h3>
              <p className="text-sm text-muted-foreground">
                Reinforce your understanding with tailored visual associations and memory aids.
              </p>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WordExplorer;