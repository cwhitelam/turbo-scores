import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallbackProps } from './ErrorFallback';

interface RootErrorBoundaryProps {
    children: ReactNode;
    fallback: React.FC<ErrorFallbackProps>;
}

interface RootErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * A specialized error boundary for the root application
 * This catches any uncaught errors in the entire application
 */
class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
    constructor(props: RootErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Root Error Boundary caught an error:', error, errorInfo);
        // Here you could add reporting to your error tracking service
    }

    resetError = (): void => {
        this.setState({
            hasError: false,
            error: null
        });
    };

    render(): ReactNode {
        const { hasError, error } = this.state;
        const { children, fallback: FallbackComponent } = this.props;

        if (hasError && error) {
            const Fallback = FallbackComponent;
            return (
                <Fallback
                    error={error}
                    componentName="Application Root"
                    resetError={this.resetError}
                />
            );
        }

        return children;
    }
}

export default RootErrorBoundary; 