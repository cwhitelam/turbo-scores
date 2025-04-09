import { useCallback } from 'react';

interface ErrorTrackingOptions {
    /** The component or section where the error occurred */
    componentName?: string;
    /** Additional context about the error */
    context?: Record<string, any>;
    /** Whether to alert the user about the error */
    silent?: boolean;
}

/**
 * A hook for tracking errors in the application
 * Can be expanded to send errors to an error tracking service
 */
export function useErrorTracking() {
    /**
     * Track an error that occurred in the application
     */
    const trackError = useCallback((error: Error, options: ErrorTrackingOptions = {}) => {
        const { componentName = 'Unknown', context = {}, silent = false } = options;

        // Log the error to the console
        console.error(`Error in ${componentName}:`, error, context);

        // In a real application, you would send this to your error tracking service
        // Example: sendToErrorTrackingService(error, { componentName, context });

        // Alert the user if not silent
        if (!silent && process.env.NODE_ENV === 'development') {
            console.warn('Error occurred:', error.message);
        }

        // You could also store errors in state for displaying to the user
        // or trigger notifications
    }, []);

    /**
     * Helper for try/catch blocks
     */
    const wrapWithErrorHandling = useCallback(<T extends (...args: any[]) => any>(
        fn: T,
        options: ErrorTrackingOptions = {}
    ) => {
        return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
            try {
                return await fn(...args) as ReturnType<T>;
            } catch (error) {
                trackError(error instanceof Error ? error : new Error(String(error)), options);
                throw error;
            }
        };
    }, [trackError]);

    return {
        trackError,
        wrapWithErrorHandling
    };
} 