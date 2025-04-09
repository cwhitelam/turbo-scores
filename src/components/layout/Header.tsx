import { Maximize, Minimize } from 'lucide-react';
import { useGlobalGameContext } from '../../context/GlobalGameContext';
import { SportSelector } from '../common/SportSelector';
import { useSport } from '../../context/SportContext';
import { useFullscreen } from '../../hooks/useFullscreen';
import { getOrdinalSuffix } from '../../utils/formatting';
import { AutoScrollControls } from './AutoScrollControls';
import { GamePlaySituation } from '../../types/game';

export function Header() {
    const { selectedGame } = useGlobalGameContext();
    const { currentSport } = useSport();
    const { isFullscreen, toggleFullscreen } = useFullscreen();

    // Type guard for NFL situation
    const isNFLSituation = (situation: any): situation is GamePlaySituation & { down: number; distance: number } => {
        return currentSport === 'NFL' && situation && typeof situation.down === 'number' && typeof situation.distance === 'number';
    };

    // Type guard for MLB situation
    const isMLBSituation = (situation: any): situation is GamePlaySituation & { balls: number; strikes: number; outs: number } => {
        return currentSport === 'MLB' && situation && typeof situation.balls === 'number' &&
            typeof situation.strikes === 'number' && typeof situation.outs === 'number';
    };

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
                                    {isNFLSituation(selectedGame.situation) ? (
                                        `${selectedGame.situation.down}${getOrdinalSuffix(selectedGame.situation.down)} & ${selectedGame.situation.distance}`
                                    ) : isMLBSituation(selectedGame.situation) ? (
                                        `${selectedGame.situation.balls}-${selectedGame.situation.strikes}, ${selectedGame.situation.outs} out${selectedGame.situation.outs !== 1 ? 's' : ''}`
                                    ) : null}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8">
                    <SportSelector />
                    <div className="flex gap-2 items-center">
                        <AutoScrollControls />
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        >
                            {isFullscreen ? (
                                <Minimize className="w-5 h-5 text-white" />
                            ) : (
                                <Maximize className="w-5 h-5 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
} 