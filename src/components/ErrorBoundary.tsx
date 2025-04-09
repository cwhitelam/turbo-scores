import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useErrorContext } from '../providers/ErrorProvider';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode | ((error: Error) => ReactNode);
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Higher-order component that connects the class-based ErrorBoundary
 * to our ErrorContext
 */
export const ErrorBoundaryWithContext: React.FC<ErrorBoundaryProps> = (props) => {
    const errorContext = useErrorContext();

    return (
        <ErrorBoundaryClass
            {...props}
            reportError={(error: Error, errorInfo: ErrorInfo) => {
                errorContext.reportError(error, { errorInfo });
            }}
        />
    );
};

interface ErrorBoundaryClassProps extends ErrorBoundaryProps {
    reportError: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Class-based error boundary component that catches errors in its child components
 * React error boundaries must be class components
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryClassProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryClassProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Report the error to our error reporting system
        this.props.reportError(error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError && this.state.error) {
            // If a custom fallback is provided, use it
            if (this.props.fallback) {
                if (typeof this.props.fallback === 'function') {
                    return this.props.fallback(this.state.error);
                }
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="error-boundary-fallback">
                    <h2>Something went wrong</h2>
                    <p className="error-message">{this.state.error.message}</p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Default export using the connected version
 */
export default ErrorBoundaryWithContext; 