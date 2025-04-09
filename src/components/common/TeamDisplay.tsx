import React, { useEffect, useState, memo, useMemo, Suspense } from 'react';
import { TeamInfo } from '../../types/game';
import { useSport } from '../../context/SportContext';
import { CommonIcons } from '../../utils/iconUtils';
import { OptimizedImage } from './OptimizedImage';

// Simple loading placeholder while the dot icon loads
const DotPlaceholder = () => (
    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-400/30 animate-pulse"></div>
);

interface TeamDisplayProps {
    team: TeamInfo;
    gameId: string;
    hasPossession?: boolean;
    isHomeTeam?: boolean;
    quarter?: string;
}

export const TeamDisplay = memo(function TeamDisplay({
    team,
    gameId,
    hasPossession,
    isHomeTeam,
    quarter
}: TeamDisplayProps) {
    const { currentSport } = useSport();
    const sport = currentSport.toLowerCase();
    const isGameOver = quarter?.startsWith('F') || quarter === 'Final';
    const [prevScore, setPrevScore] = useState(team.score);
    const [isScoreIncreased, setIsScoreIncreased] = useState(false);

    // Generate team logo URL
    const logoUrl = useMemo(() =>
        `https://a.espncdn.com/i/teamlogos/${sport}/500/${team.abbreviation.toLowerCase()}.png`,
        [sport, team.abbreviation]);

    // Memoize score display class
    const scoreClass = useMemo(() => {
        const baseClass = 'text-3xl sm:text-5xl font-bold mb-2 sm:mb-3 transition-all duration-1000';
        return isScoreIncreased
            ? `${baseClass} text-green-400 scale-125`
            : `${baseClass} text-white scale-100`;
    }, [isScoreIncreased]);

    // Track score changes and animate
    useEffect(() => {
        if (team.score !== prevScore &&
            prevScore !== undefined &&
            team.score !== undefined) {

            setIsScoreIncreased(team.score > prevScore);

            const timer = setTimeout(() => {
                setIsScoreIncreased(false);
            }, 1000);

            return () => clearTimeout(timer);
        }

        if (team.score !== prevScore) {
            setPrevScore(team.score);
        }
    }, [team.score, prevScore]);

    return (
        <div
            className="p-4 sm:p-8 text-center relative"
            role="group"
            aria-label={`${team.name} team information`}
        >
            {/* Optimized team logo image */}
            <OptimizedImage
                src={logoUrl}
                alt={`${team.name} logo`}
                width={80}
                height={80}
                className="w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3 drop-shadow-lg"
                placeholder={true}
                priority={true} // Team logos are high priority for initial render
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
                        <Suspense fallback={<DotPlaceholder />}>
                            <CommonIcons.Dot className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-pulse" />
                        </Suspense>
                    </div>
                )}
                <div
                    className={scoreClass}
                    aria-label={team.score !== undefined ? `Score: ${team.score}` : 'Game not started'}
                >
                    {team.score !== undefined ? team.score : '-'}
                </div>
            </div>
        </div>
    );
});