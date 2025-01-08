import { GamePlaySituation } from '../../types/game';
import { getGameStatusDisplay } from '../../utils/gameStatusUtils';
import { getDownAndDistance, getYardLine } from '../../utils/gameUtils';
import { useSport } from '../../context/SportContext';

interface GameHeaderProps {
    quarter: string;
    timeLeft: string;
    startTime: string;
    situation?: GamePlaySituation;
    awayTeam: string;
    homeTeam: string;
}

export function GameHeader({
    quarter,
    timeLeft,
    startTime,
    situation,
}: GameHeaderProps) {
    const { currentSport } = useSport();
    const hasStarted = quarter !== '0Q';
    const gameStatus = hasStarted ? getGameStatusDisplay(quarter, timeLeft) : startTime;

    const renderSportSpecificInfo = () => {
        if (!situation) return null;

        switch (currentSport) {
            case 'NFL':
                return (
                    <div className="text-white/90 text-xs">
                        <span>
                            {getDownAndDistance(situation.down, situation.distance)}
                            {' at '}
                            {getYardLine(situation.yardLine)}
                        </span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex justify-between items-center px-3 py-2 bg-black/30">
            {/* Game Status - Left side */}
            <div className="text-white text-sm font-medium">
                {gameStatus}
            </div>

            {/* Sport-specific Game Situation - Right side */}
            {renderSportSpecificInfo()}
        </div>
    );
} 