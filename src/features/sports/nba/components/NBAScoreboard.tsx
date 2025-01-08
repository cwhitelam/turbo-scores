import { NBAGameData } from '../types/game';
import { useGameData } from '../../../../hooks/game/useGameData';
import { getTeamLogoUrl } from '../../../../utils/teamUtils';

interface NBAScoreboardProps {
    gameId: string;
    className?: string;
}

export function NBAScoreboard({ gameId, className = '' }: NBAScoreboardProps) {
    const { isLoading, error } = useGameData<NBAGameData>(gameId);

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>;
    }

    if (error || !game) {
        return <div className="text-red-500">Error loading game data</div>;
    }

    const { home, away } = game.teams;

    return (
        <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
            <div className="space-y-4">
                {/* Home Team */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img
                            src={getTeamLogoUrl('nba', home.abbreviation)}
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
                            src={getTeamLogoUrl('nba', away.abbreviation)}
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
        </div>
    );
} 