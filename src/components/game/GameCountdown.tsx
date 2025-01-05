import React from 'react';
import { Timer } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { parseGameTime } from '../utils/dateUtils';

interface GameCountdownProps {
  startTime: string;
}

export function GameCountdown({ startTime }: GameCountdownProps) {
  const timeLeft = useCountdown(parseGameTime(startTime));
  const isStartingSoon = timeLeft.hours === 0 && timeLeft.minutes < 30;

  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <div className="flex items-center justify-center gap-2 text-green-400 font-semibold">
        <Timer className="w-4 h-4" />
        <span>Starting now...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <Timer className={`w-4 h-4 ${isStartingSoon ? 'text-yellow-400' : 'text-white/80'}`} />
      <div className="flex items-center gap-3 font-mono">
        {timeLeft.hours > 0 && (
          <TimeUnit value={timeLeft.hours} unit="h" />
        )}
        <TimeUnit value={timeLeft.minutes} unit="m" />
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
    <div className="flex items-center gap-1">
      <span className="text-white font-semibold min-w-[2ch] text-right">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-white/60 text-sm">{unit}</span>
    </div>
  );
}