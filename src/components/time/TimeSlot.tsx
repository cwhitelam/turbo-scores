import React from 'react';
import { TimeSlot as TimeSlotType } from '../types/game';
import { ScoreCard } from './ScoreCard';

interface TimeSlotProps {
  slot: TimeSlotType;
}

export function TimeSlot({ slot }: TimeSlotProps) {
  return (
    <div className="mb-8 w-full px-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-4 px-2">{slot.time}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {slot.games.map((game, index) => (
          <ScoreCard key={index} {...game} />
        ))}
      </div>
    </div>
  );
}