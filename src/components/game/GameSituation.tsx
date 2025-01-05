import React from 'react';
import { ArrowRight } from 'lucide-react';
import { GamePlaySituation } from '../types/game';
import { NHLSituation } from '../types/nhl';
import { useSport } from '../context/SportContext';

interface GameSituationProps {
  quarter: string;
  timeLeft: string;
  situation?: GamePlaySituation | NHLSituation;
  awayTeam: string;
  homeTeam: string;
}

export function GameSituation({ quarter, timeLeft, situation, awayTeam, homeTeam }: GameSituationProps) {
  const { currentSport } = useSport();
  
  const renderSituation = () => {
    if (!situation) return null;

    switch (currentSport) {
      case 'NHL':
        const nhlSituation = situation as NHLSituation;
        return (
          <>
            <div className="text-white/90 text-sm flex items-center gap-2 justify-center">
              {nhlSituation.strength}
              {nhlSituation.powerPlay && ' - Power Play'}
            </div>
            {nhlSituation.lastPlay && (
              <div className="text-white/80 text-xs">
                {nhlSituation.lastPlay}
              </div>
            )}
          </>
        );
      
      default:
        const playSituation = situation as GamePlaySituation;
        if (!playSituation.down || !playSituation.distance) return null;
        
        return (
          <>
            <div className="text-white/90 text-sm flex items-center gap-2 justify-center">
              {playSituation.possession === awayTeam && (
                <ArrowRight className="w-4 h-4 -rotate-180 text-yellow-400" />
              )}
              {getDownAndDistance(playSituation)}
              {playSituation.possession === homeTeam && (
                <ArrowRight className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <div className="text-white/80 text-xs">
              at {getYardLine(playSituation.yardLine || 0)}
            </div>
          </>
        );
    }
  };

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10">
      <div className="bg-black/80 rounded-lg px-4 py-2 text-center">
        <div className="text-white font-bold mb-1">
          {quarter} • {timeLeft}
        </div>
        {renderSituation()}
      </div>
    </div>
  );
}

function getDownAndDistance(situation: GamePlaySituation): string {
  const down = ['1st', '2nd', '3rd', '4th'][situation.down! - 1];
  return `${down} & ${situation.distance}`;
}

function getYardLine(yardLine: number): string {
  return yardLine > 50 
    ? `OPP ${100 - yardLine}`
    : yardLine === 50
    ? '50'
    : `OWN ${yardLine}`;
}