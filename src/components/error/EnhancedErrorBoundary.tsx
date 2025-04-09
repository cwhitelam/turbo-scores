import React, { Component, ErrorInfo, ReactNode } from 'react';
import GeneralErrorFallback from './fallbacks/GeneralErrorFallback';

export interface ErrorReportingOptions {
    captureException?: (error: Error) => void;  // For integration with error tracking services
    logToServer?: boolean;                      // Whether to log errors to server
    userId?: string;                            // Optional user ID for error context
    metadata?: Record<string, any>;             // Any additional context
}

export interface EnhancedErrorBoundaryProps {
    children: ReactNode;
    FallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
    onReset?: () => void;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    errorReporting?: ErrorReportingOptions;
    errorId?: string;  // Identifier for this boundary for analytics
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * An enhanced error boundary component that provides:
 * - Custom fallback components
 * - Error reset capabilities
 * - Error reporting integrations
 * - Detailed error context
 */
export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Call the onError prop if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error caught by error boundary:', error);
            console.error('Component stack:', errorInfo.componentStack);
        }

        // Handle error reporting based on options
        this.reportError(error, errorInfo);
    }

    private reportError(error: Error, errorInfo: ErrorInfo) {
        const { errorReporting } = this.props;

        if (!errorReporting) return;

        // Use error reporting service if provided
        if (errorReporting.captureException) {
            try {
                errorReporting.captureException(error);
            } catch (reportingError) {
                console.error('Error while reporting error:', reportingError);
            }
        }

        // Log to server if enabled
        if (errorReporting.logToServer) {
            const errorData = {
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                userId: errorReporting.userId,
                metadata: errorReporting.metadata,
                errorId: this.props.errorId || 'unknown',
                url: window.location.href,
                timestamp: new Date().toISOString()
            };

            // This would be replaced with your actual error logging endpoint
            try {
                fetch('/api/log-error', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(errorData),
                }).catch(e => console.error('Failed to log error to server:', e));
            } catch (e) {
                // Fail silently, don't cause more errors
                console.error('Failed to log error to server:', e);
            }
        }
    }

    private resetError = () => {
        this.setState({ hasError: false, error: null });

        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    public render() {
        const { hasError, error } = this.state;
        const { children, FallbackComponent } = this.props;

        if (hasError && error !== null) {
            const fallbackProps = {
                error,
                resetError: this.resetError
            };

            if (FallbackComponent) {
                return <FallbackComponent {...fallbackProps} />;
            }

            // Default fallback
            return <GeneralErrorFallback {...fallbackProps} />;
        }

        return children;
    }
}

export default EnhancedErrorBoundary; 