import React from 'react';
import { TimeSlate } from '../types/game';
import { ScoreCard } from './ScoreCard';

interface TimeSlateSectionProps {
  slate: TimeSlate;
}

export function TimeSlateSection({ slate }: TimeSlateSectionProps) {
  return (
    <section className="mb-12 w-full px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 px-2">
        {slate.name} Games
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {slate.games.map((game, index) => (
          <ScoreCard key={index} {...game} />
        ))}
      </div>
    </section>
  );
}