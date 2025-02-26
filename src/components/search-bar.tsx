"use client";

import { useState, useRef, useEffect } from 'react';
import { debounce } from '@/lib/utils';
import { VisualMnemonic } from './visual-mnemonic';
import { ImageGenerationResponse } from '@/lib/ai-config';

/**
 * Enhanced SearchBar component with visual mnemonic integration
 * Features glassmorphic design and debounced search
 */
export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResponse | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock search function that would connect to Perplexity/Grok API
  const handleSearch = debounce((searchQuery: string) => {
    // Log for development purposes
    console.log(`🔍 Searching for word: ${searchQuery}`);

    if (searchQuery.length > 0) {
      setIsSearching(true);
      // Simulate API delay
      setTimeout(() => {
        setIsSearching(false);
        setShowResults(true);
      }, 1500);
    } else {
      setShowResults(false);
    }
  }, 500);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  // Handle image generation completion
  const handleImageGenerated = (image: ImageGenerationResponse) => {
    console.log(`🖼️ Image generated for "${query}":`, image.fallback ? '(fallback)' : '(from API)');
    setGeneratedImage(image);
  };

  return (
    <div className="relative" ref={resultsRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-muted-foreground">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <input
          type="text"
          placeholder="Enter a word to explore..."
          value={query}
          onChange={handleInputChange}
          className="w-full bg-background/70 dark:bg-background/40 h-14 px-12 rounded-full border border-input focus:border-primary focus:ring-1 focus:ring-primary transition-colors focus:outline-none placeholder:text-muted-foreground/70"
        />

        {isSearching && (
          <div className="absolute right-4">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Search results with visual mnemonic */}
      {query.length > 0 && showResults && !isSearching && (
        <div className="glass-effect-intense absolute top-full left-0 right-0 mt-4 p-6 rounded-xl z-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column: Visual mnemonic */}
            <div className="md:w-1/3">
              <VisualMnemonic
                word={query}
                size="sm"
                className="w-full aspect-square"
                onGenerated={handleImageGenerated}
              />
              <p className="text-center text-xs text-muted-foreground mt-2">
                {generatedImage?.fallback
                  ? 'Visual representation from our library'
                  : 'AI-generated visual representation'}
              </p>
            </div>

            {/* Right column: Word details */}
            <div className="md:w-2/3">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{query}</h3>
                <p className="text-sm text-muted-foreground">Visual language exploration</p>
              </div>

              <div className="space-y-4">
                <div className="glass-effect p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Sign up to access:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Complete definition and etymology</li>
                    <li>• Related words and concepts</li>
                    <li>• Contextual usage examples</li>
                    <li>• AI-powered semantic clusters</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2">
                  <button className="bg-primary text-primary-foreground py-2 px-4 rounded-full text-sm">
                    Sign Up Free
                  </button>
                  <button className="text-sm text-muted-foreground">Learn More</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}