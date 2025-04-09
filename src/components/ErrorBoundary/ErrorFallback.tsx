import React, { useState } from 'react';
import './error-fallback.css';

export interface ErrorFallbackProps {
    error: Error;
    componentName: string;
    resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
    error,
    componentName,
    resetError
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="error-fallback">
            <div className="error-fallback-content">
                <div className="error-fallback-icon">⚠️</div>
                <h2>Something went wrong in {componentName}</h2>

                <p>
                    We're sorry, but there was an error while trying to render this component.
                    Our team has been notified of the issue.
                </p>

                <div className="error-fallback-details">
                    <details>
                        <summary>Technical Details</summary>
                        <p><strong>Error:</strong> {error.message}</p>
                        {error.stack && (
                            <pre>{error.stack}</pre>
                        )}
                    </details>
                </div>

                <div className="error-fallback-actions">
                    <button
                        className="error-fallback-button primary"
                        onClick={resetError}
                    >
                        Try Again
                    </button>
                    <button
                        className="error-fallback-button secondary"
                        onClick={handleReload}
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorFallback; 