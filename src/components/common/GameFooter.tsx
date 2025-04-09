import React, { Suspense } from 'react';
import { GameWeather, VenueInfo } from '../../types/game';
import { formatLocation } from '../../utils/locationUtils';
import { CommonIcons } from '../../utils/iconUtils';

// Simple loading placeholder while icons load
const IconPlaceholder = () => <span className="w-3.5 h-3.5 inline-block bg-white/10 rounded-sm"></span>;

// Map weather condition to appropriate icon
function getWeatherIcon(condition: string) {
    const conditionLower = condition.toLowerCase();

    if (conditionLower === 'indoor') return CommonIcons.Home;
    if (conditionLower.includes('rain')) return CommonIcons.CloudRain;
    if (conditionLower.includes('snow')) return CommonIcons.Snowflake;
    if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) return CommonIcons.Cloud;
    if (conditionLower.includes('wind') || conditionLower.includes('breez')) return CommonIcons.Wind;
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) return CommonIcons.Sun;

    // Default
    return CommonIcons.CloudSun;
}

interface GameFooterProps {
    venue: VenueInfo;
    weather: GameWeather;
}

export function GameFooter({ venue, weather }: GameFooterProps) {
    // Select appropriate icon based on weather condition
    const WeatherIcon = getWeatherIcon(weather.condition);
    const isIndoor = weather.condition === 'Indoor';

    return (
        <div className="flex justify-between items-center px-3 py-2 bg-black/30 text-xs">
            <div className="text-white/90">
                {formatLocation(venue)}
            </div>
            <div className="flex items-center gap-1.5 text-white/90">
                {/* Lazy-loaded icon with suspense fallback */}
                <Suspense fallback={<IconPlaceholder />}>
                    <WeatherIcon className="w-3.5 h-3.5" />
                </Suspense>

                {/* Conditional display based on indoor/outdoor */}
                <span>
                    {isIndoor ? (
                        weather.condition
                    ) : (
                        `${weather.temp}°F • ${weather.condition}`
                    )}
                </span>
            </div>
        </div>
    );
} 