import React from 'react';

export interface GeneralErrorProps {
    error?: Error;
    resetError?: () => void;
    title?: string;
    message?: string;
}

/**
 * Generic error fallback component that can be used anywhere in the app
 */
export const GeneralErrorFallback: React.FC<GeneralErrorProps> = ({
    error,
    resetError,
    title = 'Something went wrong',
    message = 'We encountered an unexpected error. Please try again or refresh the page.'
}) => {
    return (
        <div className="p-5 rounded-lg bg-white shadow-sm border border-gray-100 max-w-md mx-auto my-4">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                    <svg
                        className="h-12 w-12 text-red-500 mx-auto"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
                <p className="text-gray-600 mb-4">{message}</p>

                {error && (
                    <div className="w-full">
                        <details className="mb-4">
                            <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                                View technical details
                            </summary>
                            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto max-h-40">
                                {error.stack || error.message}
                            </pre>
                        </details>
                    </div>
                )}

                {resetError && (
                    <button
                        onClick={resetError}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

export default GeneralErrorFallback; 