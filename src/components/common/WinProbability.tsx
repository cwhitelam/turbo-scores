import { useWinProbability } from '../../hooks/useWinProbability';

interface WinProbabilityProps {
    gameId: string;
    teamId?: string;
    className?: string;
}

export function WinProbability({ gameId, teamId, className = '' }: WinProbabilityProps) {
    const { probability, loading } = useWinProbability(gameId);

    // Don't show anything while loading or if we're missing required data
    if (loading || !probability || !teamId) {
        return null;
    }

    // Get the win percentage for the current team
    const isHomeTeam = teamId === probability.homeTeamId;
    const percentage = isHomeTeam ? probability.homeWinPercentage : probability.awayWinPercentage;

    // Only show if we have a valid percentage
    if (typeof percentage !== 'number' || isNaN(percentage)) {
        return null;
    }

    // Round to nearest whole number and display
    return (
        <div className={`${className} text-white/80`}>
            {Math.round(percentage)}% WIN
        </div>
    );
} 