import { ErrorReporter } from '../providers/ErrorProvider';

// Environment check
const isDev = process.env.NODE_ENV === 'development';

/**
 * Simple console-based error reporter for development
 */
export const devErrorReporter: ErrorReporter = {
    captureException: (error: Error, context?: Record<string, any>) => {
        console.group('🐛 Error Captured in Dev Mode');
        console.error(error);
        if (context) {
            console.info('Context:', context);
        }
        console.groupEnd();
    },
    captureMessage: (message: string, context?: Record<string, any>) => {
        console.group('⚠️ Message Captured in Dev Mode');
        console.warn(message);
        if (context) {
            console.info('Context:', context);
        }
        console.groupEnd();
    },
};

/**
 * Error reporter interface for production
 * This could be replaced with actual implementation for services like Sentry, LogRocket, etc.
 */
export const productionErrorReporter: ErrorReporter = {
    captureException: (error: Error, context?: Record<string, any>) => {
        // In a real application, this would send the error to a service like Sentry
        // Example: Sentry.captureException(error, { extra: context });

        // For now, log to console in a production-friendly way
        console.error('[Error Report]', error.message);

        // Optional: Send error to a backend API
        // sendErrorToApi(error, context);
    },
    captureMessage: (message: string, context?: Record<string, any>) => {
        // Example: Sentry.captureMessage(message, { extra: context });
        console.warn('[Message Report]', message);
    },
};

/**
 * Error reporting utility that automatically selects the appropriate reporter
 * based on the environment
 */
export const errorReporter: ErrorReporter = isDev
    ? devErrorReporter
    : productionErrorReporter;

/**
 * Helper function to send errors to a backend API
 */
const sendErrorToApi = async (error: Error, context?: Record<string, any>) => {
    try {
        // This is commented out as it's just an example implementation
        /*
        await fetch('/api/error-reporting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        });
        */
    } catch (e) {
        // Silently fail if error reporting fails
        console.error('Failed to send error to API:', e);
    }
};

/**
 * Global error handler for unhandled rejections and exceptions
 */
export const setupGlobalErrorHandlers = (reporter: ErrorReporter = errorReporter) => {
    // Handle promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason));

        reporter.captureException(error, {
            type: 'unhandledrejection',
            message: error.message,
        });
    });

    // Handle runtime errors
    window.addEventListener('error', (event) => {
        reporter.captureException(event.error || new Error(event.message), {
            type: 'uncaughtexception',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        });
    });
};

export default errorReporter; 