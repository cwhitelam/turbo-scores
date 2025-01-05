import React from 'react';
import { CloudSun } from 'lucide-react';
import { GameWeather } from '../types/game';

interface GameInfoProps {
  weather: GameWeather;
}

export function GameInfo({ weather }: GameInfoProps) {
  return (
    <div 
      className="flex justify-end items-center px-3 py-2"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
    >
      <div className="flex items-center gap-2 text-white">
        <CloudSun className="w-4 h-4" />
        <span className="text-sm">
          {weather.temp}°F • {weather.condition}
        </span>
      </div>
    </div>
  );
}