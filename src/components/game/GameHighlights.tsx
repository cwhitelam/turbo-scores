import React from 'react';
import { Trophy, Goal, AlertCircle } from 'lucide-react';
import { GameHighlight } from '../../types/highlights';
import { useSport } from '../../context/SportContext';

interface GameHighlightsProps {
  highlight: GameHighlight;
  teamColors: {
    primary: string;
    secondary: string;
  };
}

export function GameHighlights({ highlight, teamColors }: GameHighlightsProps) {
  const { currentSport } = useSport();

  if (currentSport !== 'NFL') return null;

  const getHighlightIcon = () => {
    switch (highlight.type) {
      case 'touchdown':
        return <Trophy className="w-4 h-4" />;
      case 'fieldgoal':
        return <Goal className="w-4 h-4" />;
      case 'turnover':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="px-3 py-2 flex items-center gap-2 text-sm border-t border-black/10"
      style={{ backgroundColor: `${teamColors.primary}20` }}
    >
      <span className="text-white/80">
        {highlight.quarter} • {highlight.timeLeft}
      </span>
      <div className="flex items-center gap-1.5 text-white">
        {getHighlightIcon()}
        <span>{highlight.text}</span>
      </div>
    </div>
  );
}