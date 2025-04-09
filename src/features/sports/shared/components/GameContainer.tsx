import React, { useEffect, useState } from 'react';
import { ScoreCard } from '../../../../components/common/ScoreCard';
import { useSportsDataQuery } from '../hooks/useSportsDataQuery';
import { useSport } from '../../../../context/SportContext';
import { Sport } from '../../../../types/sport';
import { Game } from '../../../../types/game';

// Sport-specific container to ensure complete isolation
// between different sports' data
interface SportGamesProps {
    sport: Sport;
    isActive: boolean;
}

const SportGames = React.memo(function SportGames({ sport, isActive }: SportGamesProps) {
    const { games, loading, error } = useSportsDataQuery(sport);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Track when data has been loaded once to prevent loading flickers
    useEffect(() => {
        if (!loading && games.length > 0 && !hasLoaded) {
            setHasLoaded(true);
        }
    }, [loading, games, hasLoaded]);

    // We'll always render the component but control its visibility with CSS
    // This prevents unmounting during transitions which was causing the flicker
    const isVisible = isActive;
    const displayStyle = isVisible ? {} : { display: 'none' };

    if (loading && !hasLoaded) {
        return (
            <div className="min-h-[300px] bg-gray-900 p-4 flex items-center justify-center" style={displayStyle}>
                <div className="text-white text-xl">Loading {sport} games...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[300px] bg-gray-900 p-4 flex items-center justify-center" style={displayStyle}>
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div style={displayStyle} className="transition-all duration-300" data-sport={sport}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {games.map((game) => (
                    <ScoreCard key={`${sport}-${game.id}`} {...game} gameSport={sport} />
                ))}

                {games.length === 0 && hasLoaded && (
                    <div className="col-span-2 min-h-[300px] flex items-center justify-center">
                        <div className="text-white text-xl">No {sport} games available</div>
                    </div>
                )}
            </div>
        </div>
    );
});

/**
 * Main GameContainer component that creates isolated sport-specific containers
 * to prevent any cross-sport data contamination
 */
export const GameContainer = React.memo(function GameContainer() {
    const { currentSport, isTransitioning, previousSport } = useSport();

    return (
        <div className="pt-32 pb-4 px-4 max-w-7xl mx-auto relative">
            {/* Create persistent containers for all sports */}
            {/* Use CSS to control visibility instead of conditional rendering */}
            <div className="relative">
                <SportGames sport="NFL" isActive={currentSport === 'NFL'} />
                <SportGames sport="MLB" isActive={currentSport === 'MLB'} />
                <SportGames sport="NBA" isActive={currentSport === 'NBA'} />
                <SportGames sport="NHL" isActive={currentSport === 'NHL'} />
            </div>
        </div>
    );
}); 