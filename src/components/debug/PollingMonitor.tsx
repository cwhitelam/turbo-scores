import React, { useState, useEffect } from 'react';
import { appMetrics } from '../../utils/debugUtils';

// Only render this component when in development mode
const isDev = import.meta.env.DEV;

interface PollingMetricsProps {
    showOnLoad?: boolean;
}

export function PollingMonitor({ showOnLoad = false }: PollingMetricsProps) {
    const [visible, setVisible] = useState(showOnLoad);
    const [metrics, setMetrics] = useState({
        avgInterval: 0,
        minInterval: 0,
        maxInterval: 0,
        totalPolls: 0
    });

    // Update metrics on a regular interval
    useEffect(() => {
        if (!isDev || !visible) return;

        const updateMetrics = () => {
            setMetrics(appMetrics.polling.getStats());
        };

        // Initial update
        updateMetrics();

        // Set up polling
        const intervalId = setInterval(updateMetrics, 2000);

        return () => {
            clearInterval(intervalId);
        };
    }, [visible]);

    // Toggle visibility with keyboard shortcut (Alt+P)
    useEffect(() => {
        if (!isDev) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key.toLowerCase() === 'p') {
                setVisible(v => !v);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Don't render in production
    if (!isDev) return null;

    // Hidden state
    if (!visible) {
        return (
            <div
                className="fixed bottom-4 right-4 p-2 bg-gray-800 rounded-full opacity-40 hover:opacity-100 cursor-pointer z-50"
                onClick={() => setVisible(true)}
                title="Show polling metrics (Alt+P)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-200"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="8" />
                </svg>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 p-4 bg-gray-800/90 text-white rounded-lg shadow-lg z-50 max-w-xs backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Polling Monitor</h3>
                <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => setVisible(false)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-1">
                    <div className="text-gray-400">Total polls:</div>
                    <div className="font-mono">{metrics.totalPolls}</div>

                    <div className="text-gray-400">Avg interval:</div>
                    <div className="font-mono">{(metrics.avgInterval / 1000).toFixed(1)}s</div>

                    <div className="text-gray-400">Min interval:</div>
                    <div className="font-mono">{(metrics.minInterval / 1000).toFixed(1)}s</div>

                    <div className="text-gray-400">Max interval:</div>
                    <div className="font-mono">{(metrics.maxInterval / 1000).toFixed(1)}s</div>
                </div>

                <div className="text-xs text-gray-500 italic mt-2">
                    Press Alt+P to toggle this panel
                </div>
            </div>
        </div>
    );
} 