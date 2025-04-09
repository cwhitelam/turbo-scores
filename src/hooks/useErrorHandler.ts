import { useState, useCallback } from 'react';

type ErrorHandler = (error: Error) => void;

/**
 * A hook for handling errors in functional components
 * 
 * @param initialError - Optional initial error state
 * @param onError - Optional callback to be called when an error is handled
 * @returns [error, handleError, resetError] - Current error, error handler function, and reset function
 * 
 * @example
 * const [error, handleError, resetError] = useErrorHandler();
 * 
 * // In an async function:
 * try {
 *   await fetchData();
 * } catch (err) {
 *   handleError(err);
 * }
 * 
 * // When displaying:
 * if (error) {
 *   return <ApiErrorFallback error={error} resetError={resetError} />;
 * }
 */
export function useErrorHandler(
    initialError?: Error | null,
    onError?: ErrorHandler
): [Error | null, ErrorHandler, () => void] {
    const [error, setError] = useState<Error | null>(initialError || null);

    const handleError = useCallback((error: Error) => {
        // Log error to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error handled by useErrorHandler:', error);
        }

        // Set the error state
        setError(error);

        // Call the optional onError callback
        if (onError) {
            onError(error);
        }
    }, [onError]);

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    return [error, handleError, resetError];
}

export default useErrorHandler; 