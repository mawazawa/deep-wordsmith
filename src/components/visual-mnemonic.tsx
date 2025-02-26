"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useImageGeneration } from '@/hooks/use-image-generation';
import { ImageGenerationResponse } from '@/lib/api/types/api-types';

interface VisualMnemonicProps {
  word: string;
  className?: string;
  onGenerated?: (image: ImageGenerationResponse) => void;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Visual Mnemonic component for displaying AI-generated images
 * to enhance word retention and understanding
 */
export function VisualMnemonic({
  word,
  className = '',
  onGenerated,
  size = 'md'
}: VisualMnemonicProps) {
  // Use our enhanced image generation hook
  const { generateImage, data, isLoading, error, reset, isFallback } = useImageGeneration(word);
  const [retryCount, setRetryCount] = useState(0);

  // Determine dimensions based on size prop
  const dimensions = {
    sm: { width: 200, height: 200 },
    md: { width: 300, height: 300 },
    lg: { width: 400, height: 400 },
  }[size];

  // Generate image when word changes
  useEffect(() => {
    if (word && word.trim().length > 0) {
      generateImage();

      // Notify parent component when image is generated
      if (data && onGenerated) {
        onGenerated(data);
      }
    }
  }, [word, generateImage, data, onGenerated]);

  // Handle retry button click
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    reset();
    generateImage();
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={`glass-effect flex flex-col items-center justify-center ${className}`} style={dimensions}>
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2"></div>
        <p className="text-sm text-muted-foreground">Generating visual for "{word}"...</p>
        <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
      </div>
    );
  }

  // Render error state with retry option
  if (error && !data) {
    return (
      <div className={`glass-effect flex flex-col items-center justify-center p-4 ${className}`} style={dimensions}>
        <div className="text-destructive mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-sm">Failed to generate visual</p>
        <button
          onClick={handleRetry}
          className="mt-2 text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-full transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Render generated image or fallback
  if (data) {
    return (
      <div className={`relative ${className}`} style={dimensions}>
        <div className="glass-effect absolute inset-0 overflow-hidden rounded-xl">
          <Image
            src={data.url}
            alt={`Visual representation of ${word}`}
            fill
            className="object-cover transition-opacity"
            sizes={`(max-width: 768px) 100vw, ${dimensions.width}px`}
            priority
          />

          {/* Show fallback badge if using fallback image */}
          {isFallback && (
            <div className="absolute bottom-2 right-2 bg-background/80 text-xs px-2 py-1 rounded-full">
              Fallback Image
            </div>
          )}

          {/* Retry button for fallback images */}
          {isFallback && retryCount < 2 && (
            <button
              onClick={handleRetry}
              className="absolute top-2 right-2 bg-background/80 hover:bg-background/95 text-xs px-2 py-1 rounded-full transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render empty state
  return (
    <div className={`glass-effect flex items-center justify-center ${className}`} style={dimensions}>
      <p className="text-sm text-muted-foreground">Enter a word to generate a visual</p>
    </div>
  );
}