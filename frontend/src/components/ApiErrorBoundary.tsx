/**
 * ============================================================================
 * API ERROR BOUNDARY
 * ============================================================================
 * React error boundary for catching and displaying API errors
 */

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ApiError, getUserFriendlyErrorMessage } from '@/utils/api-errors';
import { captureException } from '@/lib/sentry';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ApiErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ApiErrorBoundary] Uncaught error:', error, errorInfo);
    
    // Report to Sentry
    captureException(error, { 
      componentStack: errorInfo.componentStack,
      boundary: 'ApiErrorBoundary'
    });

    this.setState({ errorInfo });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.reset();
    }
  }

  private reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isApiError = this.state.error instanceof ApiError;
      const userMessage = this.state.error 
        ? getUserFriendlyErrorMessage(this.state.error)
        : 'Something went wrong';

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
              <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
              <p className="text-muted-foreground">
                {userMessage}
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="text-sm font-mono space-y-1">
                    <p><strong>Type:</strong> {this.state.error.name}</p>
                    <p><strong>Message:</strong> {this.state.error.message}</p>
                    {isApiError && (
                      <p><strong>Status:</strong> {(this.state.error as ApiError).statusCode}</p>
                    )}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs">Component Stack</summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-muted rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.reset} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline">
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant="ghost">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to trigger error boundary reset
 */
export function useErrorBoundary() {
  const [key, setKey] = React.useState(0);
  
  return {
    key,
    reset: () => setKey(prev => prev + 1),
  };
}

export default ApiErrorBoundary;
