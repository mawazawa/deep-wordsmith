'use client';

import React, { createContext, useContext, useCallback, useReducer } from 'react';
import { toast } from 'sonner';

/**
 * Error Context
 *
 * Provides global error tracking, management, and reporting across the application.
 * Centralizes error handling logic and allows for consistent error responses.
 */

// Define error state structure
type ErrorState = {
  errors: Array<{
    id: string;
    timestamp: Date;
    message: string;
    componentStack?: string;
    code?: string;
    handled: boolean;
  }>;
};

// Define actions for error reducer
type ErrorAction =
  | { type: 'ADD_ERROR'; error: Error; componentStack?: string; code?: string }
  | { type: 'DISMISS_ERROR'; id: string }
  | { type: 'MARK_HANDLED'; id: string }
  | { type: 'CLEAR_ALL' };

// Initial state with empty errors array
const initialState: ErrorState = {
  errors: []
};

// Reducer function to manage error state
const errorReducer = (state: ErrorState, action: ErrorAction): ErrorState => {
  switch (action.type) {
    case 'ADD_ERROR':
      // Add new error to the start of the array and cap at 10 most recent errors
      return {
        ...state,
        errors: [
          {
            id: generateErrorId(),
            timestamp: new Date(),
            message: action.error.message || 'Unknown error',
            componentStack: action.componentStack,
            code: action.code,
            handled: false
          },
          ...state.errors
        ].slice(0, 10)
      };

    case 'DISMISS_ERROR':
      // Remove error by id
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.id)
      };

    case 'MARK_HANDLED':
      // Mark error as handled
      return {
        ...state,
        errors: state.errors.map(error =>
          error.id === action.id ? { ...error, handled: true } : error
        )
      };

    case 'CLEAR_ALL':
      // Clear all errors
      return {
        ...state,
        errors: []
      };

    default:
      return state;
  }
};

// Generate a unique ID for each error
function generateErrorId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Create context
const ErrorContext = createContext<{
  state: ErrorState;
  dispatch: React.Dispatch<ErrorAction>;
  captureError: (error: Error, componentStack?: string, code?: string) => void;
  dismissError: (id: string) => void;
  clearAllErrors: () => void;
}>({
  state: initialState,
  dispatch: () => null,
  captureError: () => null,
  dismissError: () => null,
  clearAllErrors: () => null
});

/**
 * ErrorProvider Component
 *
 * Wraps your application to provide error handling capabilities.
 */
export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Capture an error and optionally show a toast
  const captureError = useCallback(
    (error: Error, componentStack?: string, code?: string, showToast = true) => {
      console.error('Error captured by ErrorContext:', error);
      if (componentStack) {
        console.error('Component Stack:', componentStack);
      }

      // Add error to state
      dispatch({
        type: 'ADD_ERROR',
        error,
        componentStack,
        code
      });

      // Optionally show toast notification
      if (showToast) {
        toast.error(error.message, {
          description: 'An error occurred. Our team has been notified.',
          duration: 5000,
        });
      }

      // Here you could add reporting to external services
      // reportToExternalService(error, componentStack, code);
    },
    [dispatch]
  );

  // Dismiss a single error
  const dismissError = useCallback(
    (id: string) => {
      dispatch({
        type: 'DISMISS_ERROR',
        id
      });
    },
    [dispatch]
  );

  // Clear all errors
  const clearAllErrors = useCallback(
    () => {
      dispatch({
        type: 'CLEAR_ALL'
      });
    },
    [dispatch]
  );

  // Exposed context value
  const value = {
    state,
    dispatch,
    captureError,
    dismissError,
    clearAllErrors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

/**
 * useErrorHandling Hook
 *
 * Custom hook to access and utilize error handling functions throughout the app.
 */
export const useErrorHandling = () => {
  const context = useContext(ErrorContext);

  if (context === undefined) {
    throw new Error('useErrorHandling must be used within an ErrorProvider');
  }

  return context;
};

/**
 * withErrorHandling HOC
 *
 * Higher-Order Component that wraps a component with error handling capabilities.
 */
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';

  const WrappedComponent: React.FC<P> = (props) => {
    const { captureError } = useErrorHandling();

    // Simplified error boundary pattern
    try {
      return <Component {...props} />;
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error(String(error)),
        `Error in ${displayName}`
      );
      return null;
    }
  };

  WrappedComponent.displayName = `withErrorHandling(${displayName})`;
  return WrappedComponent;
}

// Optional: Function to report errors to external services
function reportToExternalService(error: Error, componentStack?: string, code?: string) {
  // This would be implemented based on your monitoring/logging service
  // Example for Sentry:
  // Sentry.captureException(error, {
  //   extra: { componentStack, code }
  // });
  console.log('Would report to error service:', error, componentStack, code);
}