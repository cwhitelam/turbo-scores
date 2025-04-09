import React, { lazy } from 'react';

// Create type for icon components
export type IconComponent = React.ComponentType<{
    className?: string;
    size?: number | string;
    strokeWidth?: number;
}>;

/**
 * Utility function to dynamically import icons from Lucide
 * Improves bundle size by only importing used icons
 */
export function loadLucideIcon(iconName: string): Promise<{ default: IconComponent }> {
    return import(`lucide-react/dist/esm/icons/${iconName}`)
        .catch(error => {
            console.error(`Failed to load icon: ${iconName}`, error);
            // Fallback to a simple placeholder icon if loading fails
            return { default: createPlaceholderIcon(iconName) };
        });
}

/**
 * Creates a simple SVG placeholder when an icon fails to load
 */
function createPlaceholderIcon(name: string): IconComponent {
    return ({ className, size = 24 }) => (
        React.createElement('svg', {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            className,
            'aria-hidden': true,
            children: [
                React.createElement('rect', {
                    key: 'rect',
                    x: 2,
                    y: 2,
                    width: 20,
                    height: 20,
                    rx: 4
                }),
                React.createElement('text', {
                    key: 'text',
                    x: 12,
                    y: 14,
                    textAnchor: 'middle',
                    fill: 'currentColor',
                    stroke: 'none',
                    fontSize: 8,
                    children: name.substring(0, 2).toUpperCase()
                })
            ]
        })
    );
}

/**
 * Commonly used icons, preloaded for efficiency
 */
export const CommonIcons = {
    // Weather
    CloudSun: lazy(() => loadLucideIcon('cloud-sun')),
    CloudRain: lazy(() => loadLucideIcon('cloud-rain')),
    Cloud: lazy(() => loadLucideIcon('cloud')),
    Sun: lazy(() => loadLucideIcon('sun')),
    Wind: lazy(() => loadLucideIcon('wind')),
    Snowflake: lazy(() => loadLucideIcon('snowflake')),

    // Navigation
    ChevronDown: lazy(() => loadLucideIcon('chevron-down')),
    ChevronUp: lazy(() => loadLucideIcon('chevron-up')),
    ChevronLeft: lazy(() => loadLucideIcon('chevron-left')),
    ChevronRight: lazy(() => loadLucideIcon('chevron-right')),

    // UI
    Home: lazy(() => loadLucideIcon('home')),
    Calendar: lazy(() => loadLucideIcon('calendar')),
    Settings: lazy(() => loadLucideIcon('settings')),
    RefreshCw: lazy(() => loadLucideIcon('refresh-cw')),
    Dot: lazy(() => loadLucideIcon('dot')),
}; 