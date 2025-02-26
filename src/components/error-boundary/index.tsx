'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ErrorFallback } from './error-fallback';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  showDetails?: boolean;
  className?: string;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  onReset?: () => void;
}

/**
 * Error Boundary Component
 *
 * A wrapper component that catches errors in its children and displays a fallback UI
 * Uses the react-error-boundary package with our custom styling
 */
export function ErrorBoundary({
  children,
  fallback,
  fallbackTitle,
  fallbackSubtitle,
  showDetails,
  className,
  onError,
  onReset,
}: ErrorBoundaryProps) {
  // Log errors to console and potentially to an error tracking service
  const handleError = (error: Error, info: React.ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack:', info.componentStack);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error, info);
    }

    // Here you could also log to an error tracking service like Sentry
    // if available in the future
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }: FallbackProps) =>
        fallback ? (
          <>{fallback}</>
        ) : (
          <ErrorFallback
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            title={fallbackTitle}
            subtitle={fallbackSubtitle}
            showDetails={showDetails}
            className={className}
          />
        )
      }
      onError={handleError}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Re-export the fallback component for direct use
export { ErrorFallback } from './error-fallback';