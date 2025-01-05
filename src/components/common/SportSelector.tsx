import React from 'react';
import { useSport } from '../../context/SportContext';
import { SPORTS } from '../../config/sports';
import { SportConfig } from '../../types/sport';

export function SportSelector() {
    const { currentSport, setCurrentSport } = useSport();

    return (
        <div className="flex gap-2">
            {SPORTS.map((sport: SportConfig) => (
                <button
                    key={sport.name}
                    onClick={() => setCurrentSport(sport.name)}
                    className={`
            px-4 py-2 rounded-lg font-bold text-lg transition-all
            ${currentSport === sport.name
                            ? 'bg-white text-gray-900'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }
          `}
                    aria-label={`Switch to ${sport.name}`}
                >
                    {sport.name}
                </button>
            ))}
        </div>
    );
}