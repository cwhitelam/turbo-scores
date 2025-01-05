import React from 'react';
import { NBAGameData } from '../types/game';
import { useGameState } from '../../../shared/hooks/useGameState';
import { formatNBAGameClock, formatNBAPeriod, getGamePhase } from '../utils/gameUtils';

interface NBAScoreboardProps {
    gameId: string;
    className?: string;
}

export function NBAScoreboard({ gameId, className = '' }: NBAScoreboardProps) {
    const { data: game, isLoading, error } = useGameState<NBAGameData>(gameId);

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>;
    }

    if (error || !game) {
        return <div className="text-red-500">Error loading game data</div>;
    }

    const { home, away } = game.teams;
    const phase = getGamePhase(game);
    const period = formatNBAPeriod(game.status.period);
    const clock = formatNBAGameClock(game.status.clock);

    return (
        <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-semibold text-gray-600">
                    {phase === 'pregame' ? 'Game starts soon' :
                        phase === 'postgame' ? 'Final' :
                            `${period} ${clock}`}
                </div>
                {game.broadcast && (
                    <div className="text-sm text-gray-500">
                        {game.broadcast.network}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {/* Home Team */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img
                            src={`/teams/nba/${home.abbreviation.toLowerCase()}.svg`}
                            alt={home.name}
                            className="w-8 h-8"
                        />
                        <div>
                            <div className="font-bold">{home.name}</div>
                            {home.record && (
                                <div className="text-sm text-gray-500">{home.record}</div>
                            )}
                        </div>
                    </div>
                    <div className="text-3xl font-bold">{home.score}</div>
                </div>

                {/* Away Team */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img
                            src={`/teams/nba/${away.abbreviation.toLowerCase()}.svg`}
                            alt={away.name}
                            className="w-8 h-8"
                        />
                        <div>
                            <div className="font-bold">{away.name}</div>
                            {away.record && (
                                <div className="text-sm text-gray-500">{away.record}</div>
                            )}
                        </div>
                    </div>
                    <div className="text-3xl font-bold">{away.score}</div>
                </div>
            </div>

            {/* Game Situation */}
            {phase === 'ingame' && game.situation && (
                <div className="mt-4 text-sm text-gray-600">
                    {game.situation.possession === 'home' ? home.name :
                        game.situation.possession === 'away' ? away.name : ''} Ball
                    {game.situation.shotClock && ` • ${game.situation.shotClock}s`}
                    {game.situation.inBonus && ' • Bonus'}
                </div>
            )}

            {/* Last Play */}
            {game.situation?.lastPlay && (
                <div className="mt-2 text-sm text-gray-500">
                    {game.situation.lastPlay.description}
                </div>
            )}
        </div>
    );
} 