import React from 'react';

export function SkeletonScoreCard() {
    return (
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg animate-pulse">
            {/* Game Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="h-4 w-24 bg-gray-700 rounded"></div>
                <div className="h-4 w-16 bg-gray-700 rounded"></div>
            </div>

            {/* Teams Section */}
            <div className="space-y-4 mb-4">
                {/* Away Team */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-700 rounded"></div>
                            <div className="h-3 w-16 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                    <div className="h-8 w-12 bg-gray-700 rounded"></div>
                </div>

                {/* Home Team */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-700 rounded"></div>
                            <div className="h-3 w-16 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                    <div className="h-8 w-12 bg-gray-700 rounded"></div>
                </div>
            </div>

            {/* Stats Ticker */}
            <div className="h-8 w-full bg-gray-700 rounded mb-4"></div>

            {/* Game Footer */}
            <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-gray-700 rounded"></div>
                <div className="h-4 w-24 bg-gray-700 rounded"></div>
            </div>
        </div>
    );
} 