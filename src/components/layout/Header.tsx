import React from 'react';
import { Play, Pause, Maximize, Minimize } from 'lucide-react';
import { useAutoScrollContext } from '../../context/AutoScrollContext';
import { useGlobalGameContext } from '../../context/GlobalGameContext';
import { SportSelector } from '../common/SportSelector';
import { useSport } from '../../context/SportContext';
import { SPORTS } from '../../config/sports';
import { useFullscreen } from '../../hooks/useFullscreen';
import { getOrdinalSuffix } from '../../utils/formatting';

export function Header() {
    const { isAutoScrolling, toggleAutoScroll } = useAutoScrollContext();
    const { selectedGame } = useGlobalGameContext();
    const { currentSport } = useSport();
    const { isFullscreen, toggleFullscreen } = useFullscreen();

    return (
        <header className="fixed w-full z-10 bg-gray-900/90 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="absolute top-0 left-0 right-0 px-4 py-2 bg-black/20">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="text-white/90 text-sm">
                            {selectedGame && selectedGame.quarter !== '0Q' && (
                                <span>{selectedGame.quarter} • {selectedGame.timeLeft}</span>
                            )}
                        </div>
                        <div className="text-white/90 text-sm">
                            {selectedGame?.situation && (
                                <span>
                                    {currentSport === 'NFL' ? (
                                        `${selectedGame.situation.down}${getOrdinalSuffix(selectedGame.situation.down)} & ${selectedGame.situation.distance}`
                                    ) : (
                                        `${selectedGame.situation.balls}-${selectedGame.situation.strikes}, ${selectedGame.situation.outs} out${selectedGame.situation.outs !== 1 ? 's' : ''}`
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8">
                    <SportSelector />
                    <div className="flex gap-2">
                        <button
                            onClick={toggleAutoScroll}
                            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                            aria-label={isAutoScrolling ? 'Pause auto-scroll' : 'Play auto-scroll'}
                        >
                            {isAutoScrolling ? (
                                <Pause className="w-6 h-6 text-white" />
                            ) : (
                                <Play className="w-6 h-6 text-white" />
                            )}
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        >
                            {isFullscreen ? (
                                <Minimize className="w-6 h-6 text-white" />
                            ) : (
                                <Maximize className="w-6 h-6 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
} 