import React from 'react';
import { ArrowRight } from 'lucide-react';
import { GamePlaySituation } from '../types/game';
import { getDownAndDistance, getYardLine } from '../utils/gameUtils';
import { getGameStatusDisplay } from '../utils/gameStatusUtils';

interface GameStatusPanelProps {
  quarter: string;
  timeLeft: string;
  startTime: string;
  situation?: GamePlaySituation;
  awayTeam: string;
  homeTeam: string;
}

export function GameStatusPanel({ quarter, timeLeft, startTime, situation, awayTeam, homeTeam }: GameStatusPanelProps) {
  const hasStarted = quarter !== '0Q';
  
  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10">
      <div className="bg-black/80 rounded-lg px-3 py-1.5 text-center max-w-[90%] sm:px-4 sm:py-2">
        <div className="text-white text-xs font-medium sm:text-sm sm:font-bold">
          {hasStarted ? getGameStatusDisplay(quarter, timeLeft) : startTime}
        </div>
        {situation && (
          <>
            <div className="text-white/90 text-xs flex items-center gap-1 justify-center sm:text-sm sm:gap-2">
              {situation.possession === awayTeam && (
                <ArrowRight className="w-3 h-3 -rotate-180 text-yellow-400 sm:w-4 sm:h-4" />
              )}
              {getDownAndDistance(situation.down, situation.distance)}
              {situation.possession === homeTeam && (
                <ArrowRight className="w-3 h-3 text-yellow-400 sm:w-4 sm:h-4" />
              )}
            </div>
            <div className="text-white/80 text-[10px] sm:text-xs">
              at {getYardLine(situation.yardLine)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}