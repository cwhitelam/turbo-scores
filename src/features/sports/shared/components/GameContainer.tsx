import React, { useEffect } from 'react';
import { ScoreCard } from '../../../../components/common/ScoreCard';
import { useSportsDataQuery } from '../hooks/useSportsDataQuery';
import { useSport } from '../../../../context/SportContext';

export const GameContainer = React.memo(function GameContainer() {
    const { currentSport } = useSport();
    const { games, loading, error } = useSportsDataQuery(currentSport);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
                <div className="text-white text-xl">Loading {currentSport} games...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-4 px-4 max-w-7xl mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {games.map((game) => (
                    <ScoreCard key={`${currentSport}-${game.id}`} {...game} />
                ))}
            </div>
        </div>
    );
}); 