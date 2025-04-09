import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface AppErrorBoundaryProps {
    children: ReactNode;
    componentName: string;
}

interface AppErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * A simplified error boundary component for use in the App
 */
class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
    constructor(props: AppErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error(`Error caught in ${this.props.componentName}:`, error, errorInfo);
    }

    resetError = (): void => {
        this.setState({
            hasError: false,
            error: null
        });
    };

    render(): ReactNode {
        const { hasError, error } = this.state;
        const { children, componentName } = this.props;

        if (hasError && error) {
            return (
                <ErrorFallback
                    error={error}
                    componentName={componentName}
                    resetError={this.resetError}
                />
            );
        }

        return children;
    }
}

export default AppErrorBoundary; 