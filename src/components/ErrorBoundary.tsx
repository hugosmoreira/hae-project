import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    // Store error info in state
    this.setState({ error, errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // TODO: Integrate with Supabase logs later
    // this.logErrorToSupabase(error, errorInfo);
  }

  handleRetry = () => {
    // Reset error state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    // Reload the page
    window.location.reload();
  };

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with project's design system
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border bg-card shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                We encountered an unexpected error. Don't worry, your data is safe.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Error Details</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground bg-background p-2 rounded border overflow-auto max-h-32">
                    <div className="font-semibold text-destructive mb-1">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={this.handleRetry} 
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={this.handleReload}
                    className="flex-1 border-primary/20 hover:bg-primary/5 hover:border-primary/30"
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={this.handleGoHome}
                  className="w-full text-muted-foreground hover:text-foreground hover:bg-muted"
                  size="sm"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>
              </div>

              {/* Support Information */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  If this problem persists, please{' '}
                  <a 
                    href="mailto:support@housingauthorityexchange.com" 
                    className="text-primary hover:underline font-medium"
                  >
                    contact support
                  </a>
                  {' '}with the error details above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ 
  children, 
  fallback, 
  onError 
}) => {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
};

// Custom error handler for logging
export const handleErrorBoundaryError = (error: Error, errorInfo: ErrorInfo) => {
  // Enhanced error logging
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.group('🚨 Error Boundary Caught Error');
  console.error('Error:', error);
  console.error('Error Info:', errorInfo);
  console.error('Full Details:', errorDetails);
  console.groupEnd();

  // TODO: Send to Supabase logs
  // logErrorToSupabase(errorDetails);
};

// Utility function for creating error boundaries with custom handlers
export const createErrorBoundary = (onError?: (error: Error, errorInfo: ErrorInfo) => void) => {
  return ({ children }: { children: ReactNode }) => (
    <ErrorBoundary onError={onError}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
