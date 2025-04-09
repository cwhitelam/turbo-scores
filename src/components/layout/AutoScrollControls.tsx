import React, { useState } from 'react';
import { Play, Pause, Settings, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useAutoScrollContext } from '../../context/AutoScrollContext';

export function AutoScrollControls() {
    const [showSettings, setShowSettings] = useState(false);
    const {
        isAutoScrolling,
        toggleAutoScroll,
        scrollSpeed,
        setScrollSpeed,
        resumeDelay,
        setResumeDelay
    } = useAutoScrollContext();

    const handleSpeedChange = (increment: number) => {
        setScrollSpeed(scrollSpeed + increment);
    };

    const handleDelayChange = (increment: number) => {
        setResumeDelay(resumeDelay + increment);
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-1">
                <button
                    onClick={toggleAutoScroll}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                    aria-label={isAutoScrolling ? 'Pause auto-scroll' : 'Play auto-scroll'}
                    title={isAutoScrolling ? 'Pause auto-scroll' : 'Play auto-scroll'}
                >
                    {isAutoScrolling ? (
                        <Pause className="w-5 h-5 text-white" />
                    ) : (
                        <Play className="w-5 h-5 text-white" />
                    )}
                </button>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-full hover:bg-gray-800 transition-colors ${showSettings ? 'bg-gray-800' : ''}`}
                    aria-label="Auto-scroll settings"
                    title="Auto-scroll settings"
                >
                    <Settings className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-md shadow-lg p-3 w-64 z-20">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-white text-sm font-semibold">Auto-Scroll Settings</h3>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="text-gray-400 hover:text-white"
                            aria-label="Close settings"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Speed control */}
                    <div className="mb-3">
                        <label className="text-gray-300 text-xs block mb-1">Scroll Speed: {scrollSpeed}</label>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => handleSpeedChange(-5)}
                                className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                                aria-label="Decrease speed"
                                disabled={scrollSpeed <= 5}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="w-40 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${(scrollSpeed - 5) * 100 / 95}%` }}
                                />
                            </div>

                            <button
                                onClick={() => handleSpeedChange(5)}
                                className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                                aria-label="Increase speed"
                                disabled={scrollSpeed >= 100}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Resume delay control */}
                    <div>
                        <label className="text-gray-300 text-xs block mb-1">Resume Delay: {resumeDelay / 1000}s</label>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => handleDelayChange(-1000)}
                                className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                                aria-label="Decrease delay"
                                disabled={resumeDelay <= 1000}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="w-40 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${(resumeDelay - 1000) * 100 / 14000}%` }}
                                />
                            </div>

                            <button
                                onClick={() => handleDelayChange(1000)}
                                className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                                aria-label="Increase delay"
                                disabled={resumeDelay >= 15000}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 