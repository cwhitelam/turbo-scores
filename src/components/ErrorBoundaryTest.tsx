import React, { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';

// Component that will throw an error
const BuggyComponent: React.FC = () => {
    const [shouldThrow, setShouldThrow] = useState(false);

    if (shouldThrow) {
        throw new Error('This is a simulated error!');
    }

    return (
        <div className="buggy-component">
            <h3>Potentially Buggy Component</h3>
            <p>Click the button to simulate an error:</p>
            <button onClick={() => setShouldThrow(true)}>
                Trigger Error
            </button>
        </div>
    );
};

// Custom fallback component
const CustomFallback: React.FC<{ error: Error }> = ({ error }) => (
    <div className="custom-error-fallback">
        <h3>Custom Error UI</h3>
        <p>Oops! Something went wrong:</p>
        <pre>{error.message}</pre>
        <p>Please refresh the page or contact support if the problem persists.</p>
        <button onClick={() => window.location.reload()}>
            Refresh Page
        </button>
    </div>
);

// Example usage of ErrorBoundary
export const ErrorBoundaryExample: React.FC = () => {
    return (
        <div className="error-boundary-examples">
            <h2>Error Boundary Examples</h2>

            <div className="example">
                <h3>Example 1: Default Error UI</h3>
                <ErrorBoundary>
                    <BuggyComponent />
                </ErrorBoundary>
            </div>

            <div className="example">
                <h3>Example 2: Custom Error UI (Component)</h3>
                <ErrorBoundary fallback={<CustomFallback error={new Error('Placeholder error')} />}>
                    <BuggyComponent />
                </ErrorBoundary>
            </div>

            <div className="example">
                <h3>Example 3: Custom Error UI (Function)</h3>
                <ErrorBoundary
                    fallback={(error) => (
                        <div className="function-error-fallback">
                            <h4>Error Detected!</h4>
                            <p>{error.message}</p>
                            <button onClick={() => window.location.reload()}>
                                Reload
                            </button>
                        </div>
                    )}
                >
                    <BuggyComponent />
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default ErrorBoundaryExample; 