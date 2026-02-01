/**
 * Error handling utilities for consistent error management across the app.
 * Errors are logged to database with unique codes for secure user reporting.
 */

// Generate a unique error code (ERR-XXXXXX)
export function generateErrorCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ERR-${code}`;
}

// Error types for categorization
export type ErrorType = 'runtime' | 'api' | 'network' | 'validation';

// Error log entry interface
export interface ErrorLogEntry {
  errorCode: string;
  errorMessage: string;
  errorStack?: string;
  errorType: ErrorType;
  url?: string;
  userAgent?: string;
  agencyId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Transform technical errors into user-friendly messages.
 * Never expose internal details - just helpful guidance.
 */
export function getUserFriendlyError(error: unknown, context?: string): string {
  // Network errors
  if (isNetworkError(error)) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  // Handle Response/fetch errors
  if (error instanceof Response || (error && typeof error === 'object' && 'status' in error)) {
    const status = (error as { status: number }).status;

    switch (status) {
      case 400:
        return context
          ? `Invalid ${context}. Please check your input and try again.`
          : 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Please sign in to continue.';
      case 403:
        return "You don't have permission to do this.";
      case 404:
        return context
          ? `${context} not found.`
          : 'The requested item was not found.';
      case 409:
        return context
          ? `This ${context} already exists.`
          : 'This item already exists.';
      case 422:
        return 'Please check your input and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Something went wrong on our end. Please try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for specific error types
    if (error.name === 'AbortError') {
      return 'Request was cancelled. Please try again.';
    }
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
  }

  // Default message
  return 'Something went wrong. Please try again.';
}

/**
 * Check if an error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('networkerror') ||
      message.includes('load failed')
    );
  }

  if (error instanceof Error) {
    return error.name === 'NetworkError';
  }

  return false;
}

/**
 * Extract error details for logging (safe for server)
 */
export function extractErrorDetails(error: unknown): {
  message: string;
  stack?: string;
  type: ErrorType;
} {
  if (isNetworkError(error)) {
    return {
      message: error instanceof Error ? error.message : 'Network error',
      stack: error instanceof Error ? error.stack : undefined,
      type: 'network',
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      type: 'runtime',
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      type: 'runtime',
    };
  }

  return {
    message: String(error),
    type: 'runtime',
  };
}

/**
 * Format error for display (includes code for reporting)
 */
export function formatErrorForDisplay(errorCode: string): {
  title: string;
  message: string;
  code: string;
} {
  return {
    title: 'Something went wrong',
    message: "We couldn't complete this action. Please try again.",
    code: errorCode,
  };
}
