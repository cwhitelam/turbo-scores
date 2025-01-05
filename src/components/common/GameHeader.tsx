import { Disc } from 'lucide-react';
import { GamePlaySituation } from '../../types/game';
import { getGameStatusDisplay } from '../../utils/gameStatusUtils';
import { getDownAndDistance, getYardLine } from '../../utils/gameUtils';

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
    awayTeam,
    homeTeam
}: GameHeaderProps) {
    const hasStarted = quarter !== '0Q';
    const gameStatus = hasStarted ? getGameStatusDisplay(quarter, timeLeft) : startTime;

    return (
        <div className="flex justify-between items-center px-3 py-2 bg-black/30">
            {/* Game Status - Left side */}
            <div className="text-white text-sm font-medium">
                {gameStatus}
            </div>

            {/* Game Situation - Right side */}
            {situation && (
                <div className="text-white/90 text-xs flex items-center gap-2">
                    {situation.possession === awayTeam && (
                        <Disc className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                    )}
                    <span>
                        {getDownAndDistance(situation.down, situation.distance)}
                        {' at '}
                        {getYardLine(situation.yardLine)}
                    </span>
                    {situation.possession === homeTeam && (
                        <Disc className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                    )}
                </div>
            )}
        </div>
    );
} 