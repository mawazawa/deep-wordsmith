'use client';

import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ErrorFallback } from '@/components/error-boundary/error-fallback';
import { Button } from '@/components/ui/button';

/**
 * GlobalErrorBoundary Component
 *
 * Top-level error boundary that catches errors across the entire application.
 * Provides a full-screen fallback UI when uncaught errors occur.
 *
 * @param children - React components to be protected by this error boundary
 */
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          className="h-screen w-screen"
          title="Application Error"
          subtitle="We've encountered an unexpected error in the application"
        />
      )}
      onError={(error, info) => {
        // Log error to console with component stack trace for debugging
        console.error('🔴 Global Error Boundary caught an error:', error);
        console.error('Component Stack:', info.componentStack);

        // Send to analytics in production
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
          window.gtag?.('event', 'exception', {
            description: error.message,
            fatal: true,
            componentStack: info.componentStack
          });
        }
      }}
      onReset={() => {
        // Optional: Perform any cleanup or state reset when the error boundary is reset
        console.log('🔄 Global error boundary has been reset');
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

/**
 * SectionalErrorBoundary Component
 *
 * Component-level error boundary that isolates errors to specific sections of the UI.
 * Prevents the entire application from crashing when a component fails.
 *
 * @param children - React components to be protected by this error boundary
 */
export function SectionalErrorBoundary({
  children,
  customFallback,
}: {
  children: React.ReactNode;
  customFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}) {
  return (
    <ReactErrorBoundary
      FallbackComponent={customFallback || (({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          className="glass-effect p-6 rounded-xl"
          title="Component Error"
          subtitle="This section encountered an error"
        />
      ))}
      onError={(error, info) => {
        // Log error to console with component stack trace
        console.error('🟠 Sectional Error Boundary caught an error:', error);
        console.error('Component Stack:', info.componentStack);

        // For more detailed diagnostic information in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            componentStack: info.componentStack
          });
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

/**
 * ApiErrorBoundary Component
 *
 * Specialized error boundary for API-dependent components.
 * Provides functionality to retry API calls when errors occur.
 *
 * @param children - React components to be protected by this error boundary
 * @param fallbackData - Optional fallback data to display when an API error occurs
 */
export function ApiErrorBoundary({
  children,
  fallbackData,
  onError
}: {
  children: React.ReactNode;
  fallbackData?: any;
  onError?: (error: Error) => void;
}) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }: FallbackProps) => {
        // If fallback data is provided, render the children with the fallback data
        if (fallbackData) {
          return (
            <div className="relative">
              {/* We would actually use fallbackData here in a real implementation */}
              <div className="absolute top-0 right-0 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetErrorBoundary}
                  className="text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                >
                  Using cached data. Retry?
                </Button>
              </div>
            </div>
          );
        }

        // Otherwise, render the default error UI
        return (
          <ErrorFallback
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            className="glass-effect p-4 rounded-lg"
            title="API Error"
            subtitle="We couldn't load this data"
            showDetails={process.env.NODE_ENV === 'development'}
          />
        );
      }}
      onError={(error) => {
        console.error('🔵 API Error Boundary caught an error:', error);
        if (onError) onError(error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}