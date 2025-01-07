import React from 'react';
import { NBALeaderCategory } from '../types/gameStats';
import { extractGameLeaders, formatLeaderDisplay } from '../utils/statsUtils';

interface GameLeadersProps {
    leaders: NBALeaderCategory[];
}

export const GameLeaders: React.FC<GameLeadersProps> = ({ leaders }) => {
    const gameLeaders = extractGameLeaders(leaders);

    return (
        <div className="mt-4 space-y-2 text-sm">
            {gameLeaders.points && (
                <div className="flex items-center space-x-2">
                    {gameLeaders.points.athlete.headshot && (
                        <img
                            src={gameLeaders.points.athlete.headshot}
                            alt={gameLeaders.points.athlete.fullName}
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <span>{formatLeaderDisplay(gameLeaders.points, 'PTS')}</span>
                </div>
            )}

            {gameLeaders.rebounds && (
                <div className="flex items-center space-x-2">
                    {gameLeaders.rebounds.athlete.headshot && (
                        <img
                            src={gameLeaders.rebounds.athlete.headshot}
                            alt={gameLeaders.rebounds.athlete.fullName}
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <span>{formatLeaderDisplay(gameLeaders.rebounds, 'REB')}</span>
                </div>
            )}

            {gameLeaders.assists && (
                <div className="flex items-center space-x-2">
                    {gameLeaders.assists.athlete.headshot && (
                        <img
                            src={gameLeaders.assists.athlete.headshot}
                            alt={gameLeaders.assists.athlete.fullName}
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <span>{formatLeaderDisplay(gameLeaders.assists, 'AST')}</span>
                </div>
            )}
        </div>
    );
}; 