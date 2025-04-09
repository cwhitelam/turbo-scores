import React from 'react';

export interface ApiErrorProps {
    error?: Error;
    resetError?: () => void;
    message?: string;
    isLoading?: boolean;
}

/**
 * Fallback component for API errors with retry functionality
 */
export const ApiErrorFallback: React.FC<ApiErrorProps> = ({
    error,
    resetError,
    message = "We couldn't load the data you requested",
    isLoading = false
}) => {
    return (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-800">
            <div className="flex items-center space-x-2 mb-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
                <h3 className="text-base font-medium">{message}</h3>
            </div>

            {error && (
                <p className="text-sm mb-3 text-red-600 font-mono overflow-auto max-h-20 p-2 bg-red-50/50 rounded">
                    {error.message}
                </p>
            )}

            {resetError && (
                <button
                    onClick={resetError}
                    disabled={isLoading}
                    className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Loading...' : 'Try Again'}
                </button>
            )}
        </div>
    );
};

export default ApiErrorFallback; 