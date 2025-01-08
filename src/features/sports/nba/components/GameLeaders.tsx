import React from 'react';
import { extractGameLeaders, formatLeaderDisplay } from '../utils/statsUtils';
import { useNBAGameLeaders } from '../hooks/useNBAGameLeaders';

interface GameLeadersProps {
    gameId: string;
}

export const GameLeaders: React.FC<GameLeadersProps> = ({ gameId }) => {
    const { leaders, boxScore, loading, error } = useNBAGameLeaders(gameId);

    if (loading) {
        return (
            <div className="mt-4 space-y-3">
                <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (error || !leaders || leaders.length === 0) {
        return (
            <div className="mt-4 text-center text-gray-500">
                Stats coming soon...
            </div>
        );
    }

    const gameLeaders = extractGameLeaders(leaders, boxScore);

    const renderLeader = (leader: any, statType: string) => {
        if (!leader) return null;

        return (
            <div className="flex items-center">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">{leader.athlete.shortName}</span>
                    <span className="text-xs text-gray-600">{formatLeaderDisplay(leader, statType)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="mt-4 space-y-3">
            {renderLeader(gameLeaders.points, 'PTS')}
            {renderLeader(gameLeaders.rebounds, 'REB')}
            {renderLeader(gameLeaders.assists, 'AST')}
        </div>
    );
}; 