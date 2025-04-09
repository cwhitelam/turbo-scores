import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface GameErrorProps {
    error?: Error;
    resetError?: () => void;
    gameId?: string;
    sportId?: string;
}

/**
 * Fallback component specifically for game-related errors
 */
export const GameErrorFallback: React.FC<GameErrorProps> = ({
    error,
    resetError,
    gameId,
    sportId
}) => {
    const navigate = useNavigate();

    const handleBackToScores = () => {
        if (sportId) {
            navigate(`/${sportId}`);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="p-6 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 max-w-md mx-auto my-4">
            <div className="flex items-center space-x-3 mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                <h3 className="text-lg font-semibold">Game Data Error</h3>
            </div>

            <p className="mb-4">
                We're having trouble loading this game. This could be due to:
            </p>

            <ul className="list-disc list-inside mb-4 text-sm space-y-1 text-gray-600">
                <li>The game may no longer be available</li>
                <li>There might be a temporary issue with our data provider</li>
                <li>Your connection might be experiencing issues</li>
            </ul>

            {error && (
                <p className="text-sm mb-4 text-red-600 font-mono overflow-auto max-h-24 p-2 bg-gray-100 rounded">
                    {error.message}
                </p>
            )}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {resetError && (
                    <button
                        onClick={resetError}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                    >
                        Try Again
                    </button>
                )}

                <button
                    onClick={handleBackToScores}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
                >
                    Back to Scores
                </button>
            </div>
        </div>
    );
};

export default GameErrorFallback; 