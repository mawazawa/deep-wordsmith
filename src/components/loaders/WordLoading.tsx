import React from 'react';
import { Spinner } from './spinner';

/**
 * WordLoading component
 *
 * Displays a loading state when fetching word data
 */
export function WordLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-4 text-center border border-dashed rounded-lg">
      <Spinner size="lg" />
      <div className="max-w-md space-y-2">
        <h3 className="text-lg font-medium">Analyzing word...</h3>
        <p className="text-sm text-muted-foreground">
          Exploring meanings, etymology, and related concepts
        </p>
      </div>
    </div>
  );
}

export default WordLoading;