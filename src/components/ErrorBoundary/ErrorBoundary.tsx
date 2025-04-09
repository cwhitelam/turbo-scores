import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface ErrorBoundaryProps {
    children: ReactNode;
    componentName?: string;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // You can log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    resetError = (): void => {
        this.setState({
            hasError: false,
            error: null
        });
    };

    render(): ReactNode {
        const { hasError, error } = this.state;
        const { children, componentName, fallback } = this.props;

        if (hasError && error) {
            if (fallback) {
                return fallback;
            }

            return (
                <ErrorFallback
                    error={error}
                    componentName={componentName || 'Unknown Component'}
                    resetError={this.resetError}
                />
            );
        }

        return children;
    }
}

export default ErrorBoundary; 