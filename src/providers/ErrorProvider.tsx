import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define the error reporting service interface
export interface ErrorReporter {
    captureException: (error: Error, context?: Record<string, any>) => void;
    captureMessage: (message: string, context?: Record<string, any>) => void;
}

// Define what the context will provide
export interface ErrorContextType {
    reportError: (error: Error, context?: Record<string, any>) => void;
    reportMessage: (message: string, context?: Record<string, any>) => void;
    lastError: Error | null;
    clearLastError: () => void;
}

// Create context with a default value
const ErrorContext = createContext<ErrorContextType>({
    reportError: () => { },
    reportMessage: () => { },
    lastError: null,
    clearLastError: () => { },
});

// Props for the provider component
export interface ErrorProviderProps {
    children: ReactNode;
    errorReporter?: ErrorReporter;
    enableConsoleLogging?: boolean;
    userId?: string;
}

/**
 * Provider component for global error handling
 */
export const ErrorProvider: React.FC<ErrorProviderProps> = ({
    children,
    errorReporter,
    enableConsoleLogging = process.env.NODE_ENV !== 'production',
    userId,
}) => {
    const [lastError, setLastError] = useState<Error | null>(null);

    // Function to report errors
    const reportError = useCallback(
        (error: Error, context: Record<string, any> = {}) => {
            // Set the last error
            setLastError(error);

            // Log to console if enabled
            if (enableConsoleLogging) {
                console.error('Application error:', error);
                if (Object.keys(context).length > 0) {
                    console.error('Error context:', context);
                }
            }

            // Use error reporter if provided
            if (errorReporter) {
                try {
                    errorReporter.captureException(error, {
                        ...context,
                        userId,
                        url: window.location.href,
                    });
                } catch (reportingError) {
                    console.error('Error reporting failed:', reportingError);
                }
            }
        },
        [errorReporter, enableConsoleLogging, userId]
    );

    // Function to report message-based errors
    const reportMessage = useCallback(
        (message: string, context: Record<string, any> = {}) => {
            // Log to console if enabled
            if (enableConsoleLogging) {
                console.warn('Application warning:', message);
                if (Object.keys(context).length > 0) {
                    console.warn('Warning context:', context);
                }
            }

            // Use error reporter if provided
            if (errorReporter) {
                try {
                    errorReporter.captureMessage(message, {
                        ...context,
                        userId,
                        url: window.location.href,
                    });
                } catch (reportingError) {
                    console.error('Error reporting failed:', reportingError);
                }
            }
        },
        [errorReporter, enableConsoleLogging, userId]
    );

    // Function to clear the last error
    const clearLastError = useCallback(() => {
        setLastError(null);
    }, []);

    // Context value
    const contextValue: ErrorContextType = {
        reportError,
        reportMessage,
        lastError,
        clearLastError,
    };

    return (
        <ErrorContext.Provider value={contextValue}>{children}</ErrorContext.Provider>
    );
};

/**
 * Hook to use the error context
 */
export const useErrorContext = () => {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useErrorContext must be used within an ErrorProvider');
    }
    return context;
};

export default ErrorProvider; 