import { TeamInfo } from '../../types/game';
import { WinProbability } from './WinProbability';
import { useSport } from '../../context/SportContext';

interface TeamDisplayProps {
    team: TeamInfo;
    gameId: string;
}

export function TeamDisplay({ team, gameId }: TeamDisplayProps) {
    const { currentSport } = useSport();
    const sport = currentSport.toLowerCase();

    return (
        <div
            className="p-4 sm:p-8 text-center"
            role="group"
            aria-label={`${team.name} team information`}
        >
            <img
                src={`https://a.espncdn.com/i/teamlogos/${sport}/500/${team.abbreviation.toLowerCase()}.png`}
                alt={`${team.name} logo`}
                className="w-12 h-12 sm:w-20 sm:h-20 object-contain mx-auto mb-2 sm:mb-3 drop-shadow-lg"
            />
            <div className="font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 text-white truncate">
                {team.name}
            </div>
            <div className="text-xs text-white/70 mb-1 sm:mb-2">
                ({team.record})
            </div>
            <div
                className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-3 text-white"
                aria-label={`Score: ${team.score}`}
            >
                {team.score}
            </div>
            <WinProbability
                gameId={gameId}
                teamId={team.id}
                className="text-xs sm:text-base rounded-full px-3 py-1 sm:px-4 sm:py-1.5 inline-block font-medium bg-black/20"
            />
        </div>
    );
} 