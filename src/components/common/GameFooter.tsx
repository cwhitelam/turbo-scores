import { CloudSun } from 'lucide-react';
import { GameWeather, VenueInfo } from '../../types/game';
import { formatLocation } from '../../utils/locationUtils';

interface GameFooterProps {
    venue: VenueInfo;
    weather: GameWeather;
}

export function GameFooter({ venue, weather }: GameFooterProps) {
    return (
        <div className="flex justify-between items-center px-3 py-2 bg-black/30 text-xs">
            <div className="text-white/90">
                {formatLocation(venue)}
            </div>
            <div className="flex items-center gap-1.5 text-white/90">
                <CloudSun className="w-3.5 h-3.5" />
                <span>{weather.temp}°F • {weather.condition}</span>
            </div>
        </div>
    );
} 