import { TeamInfo } from '../../types/game';
import { useSport } from '../../context/SportContext';
import { Dot } from 'lucide-react';
import { useEffect, useState } from 'react';

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development';

interface TeamDisplayProps {
    team: TeamInfo;
    gameId: string;
    hasPossession?: boolean;
    isHomeTeam?: boolean;
    quarter?: string;
}

export function TeamDisplay({ team, gameId, hasPossession, isHomeTeam, quarter }: TeamDisplayProps) {
    const { currentSport } = useSport();
    const sport = currentSport.toLowerCase();
    const isGameOver = quarter?.startsWith('FINAL') || quarter?.startsWith('F');
    const [prevScore, setPrevScore] = useState(team.score);
    const [isScoreIncreased, setIsScoreIncreased] = useState(false);

    // Construct a unique URL with the sport to avoid caching issues
    const logoUrl = `https://a.espncdn.com/i/teamlogos/${sport}/500/${team.abbreviation.toLowerCase()}.png?sport=${sport}&v=${Date.now()}`;

    // Handle score changes
    useEffect(() => {
        if (team.score !== prevScore && prevScore !== undefined && team.score !== undefined) {
            setIsScoreIncreased(team.score > prevScore);
            const timer = setTimeout(() => {
                setIsScoreIncreased(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
        setPrevScore(team.score);
    }, [team.score, prevScore]);

    // Image error handler
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        // Prevent error handler from being called multiple times
        (e.target as HTMLImageElement).onerror = null;

        // Only log in development mode
        if (isDevelopment) {
            console.error(`Logo failed to load for ${team.abbreviation} in ${sport}`);
        }
    };

    return (
        <div
            className="p-4 sm:p-8 text-center relative"
            role="group"
            aria-label={`${team.name} team information`}
        >
            <img
                src={logoUrl}
                alt={`${team.name} logo`}
                className="w-12 h-12 sm:w-20 sm:h-20 object-contain mx-auto mb-2 sm:mb-3 drop-shadow-lg"
                key={`${sport}-${team.abbreviation}-${Date.now()}`} // Force re-render when sport changes
                onError={handleImageError}
            />
            <div className="font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 text-white truncate">
                {team.name}
            </div>
            <div className="text-xs text-white/70 mb-1 sm:mb-2">
                ({team.record})
            </div>
            <div className="relative">
                {hasPossession && currentSport === 'NFL' && !isGameOver && (
                    <div className={`absolute top-1/2 -translate-y-1/2 ${isHomeTeam ? 'left-[25%]' : 'right-[25%]'}`}>
                        <Dot className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-pulse" />
                    </div>
                )}
                <div
                    className={`text-3xl sm:text-5xl font-bold mb-2 sm:mb-3 transition-all duration-1000 ${isScoreIncreased
                        ? 'text-green-400 scale-125'
                        : 'text-white scale-100'
                        }`}
                    aria-label={team.score !== undefined ? `Score: ${team.score}` : 'Game not started'}
                >
                    {team.score !== undefined ? team.score : '-'}
                </div>
            </div>
        </div>
    );
}