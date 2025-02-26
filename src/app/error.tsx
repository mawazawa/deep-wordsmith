'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Component
 *
 * This component handles runtime errors in the application.
 * It displays a user-friendly error message and provides a way to recover.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-blue-950">
      <div className="relative w-full max-w-md p-6 overflow-hidden backdrop-blur-lg rounded-2xl border border-blue-100/20 dark:border-blue-800/20 shadow-xl bg-white/70 dark:bg-slate-900/70">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-red-500 dark:text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              {process.env.NODE_ENV === 'development'
                ? error.message || 'An unexpected error occurred'
                : 'An unexpected error occurred while processing your request'}
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-slate-800 text-slate-200 rounded-lg text-sm text-left overflow-x-auto">
                <code className="whitespace-pre-wrap break-all">
                  {error.stack}
                </code>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Try again
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 pt-4">
              If this problem persists, please contact support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}