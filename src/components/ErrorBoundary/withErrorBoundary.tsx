import React, { ComponentType, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface WithErrorBoundaryOptions {
    componentName?: string;
    fallback?: ReactNode;
}

/**
 * Higher-order component that wraps the provided component with an ErrorBoundary
 * 
 * @param Component - The component to wrap
 * @param options - Configuration options for the ErrorBoundary
 * @returns The wrapped component with error boundary
 */
function withErrorBoundary<P extends object>(
    Component: ComponentType<P>,
    options: WithErrorBoundaryOptions = {}
): ComponentType<P> {
    const { componentName = Component.displayName || Component.name || 'Component', fallback } = options;

    const WithErrorBoundary = (props: P): JSX.Element => (
        <ErrorBoundary componentName={componentName} fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WithErrorBoundary.displayName = `WithErrorBoundary(${componentName})`;

    return WithErrorBoundary;
}

export default withErrorBoundary; 