import { Timer } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';
import { parseGameTime } from '../../utils/dateUtils';

interface GameCountdownProps {
    startTime: string;
}

export function GameCountdown({ startTime }: GameCountdownProps) {
    const timeLeft = useCountdown(parseGameTime(startTime));
    const isStartingSoon = timeLeft.hours === 0 && timeLeft.minutes < 30;

    if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        return (
            <div className="flex items-center justify-center gap-2 text-green-400 font-medium bg-green-400/10 rounded-full px-3 py-1.5">
                <Timer className="w-4 h-4" />
                <span>Starting now...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <Timer className={`w-4 h-4 ${isStartingSoon ? 'text-yellow-400' : 'text-white/80'}`} />
            <div className={`flex items-center gap-1 font-mono text-sm rounded-lg ${isStartingSoon ? 'text-yellow-400' : 'text-white'}`}>
                {timeLeft.hours > 0 && (
                    <>
                        <TimeUnit value={timeLeft.hours} unit="h" />
                        <span className="text-white/40 mx-0.5">:</span>
                    </>
                )}
                <TimeUnit value={timeLeft.minutes} unit="m" />
                <span className="text-white/40 mx-0.5">:</span>
                <TimeUnit value={timeLeft.seconds} unit="s" />
            </div>
        </div>
    );
}

interface TimeUnitProps {
    value: number;
    unit: string;
}

function TimeUnit({ value, unit }: TimeUnitProps) {
    return (
        <div className="flex items-center">
            <span className="font-medium min-w-[2ch] text-right">
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-white/40 text-xs ml-0.5">{unit}</span>
        </div>
    );
} 