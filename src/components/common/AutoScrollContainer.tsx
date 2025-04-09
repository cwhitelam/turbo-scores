import React, { useRef } from 'react';
import { useScrollBehavior } from '../../hooks/useScrollBehavior';
import { useAutoScrollContext } from '../../context/AutoScrollContext';

interface AutoScrollContainerProps {
    children: React.ReactNode;
}

export function AutoScrollContainer({ children }: AutoScrollContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const { isAutoScrolling, scrollSpeed, resumeDelay } = useAutoScrollContext();

    const { handleInteraction, handleScroll, isScrolling } = useScrollBehavior(
        containerRef,
        contentRef,
        scrollSpeed,
        resumeDelay,
        isAutoScrolling
    );

    return (
        <div className="relative">
            {isAutoScrolling && (
                <div className={`fixed bottom-4 right-4 px-3 py-1 rounded-md text-xs z-10 transition-opacity duration-300 ${isScrolling ? 'bg-green-600 opacity-60' : 'bg-yellow-600 opacity-40'}`}>
                    {isScrolling ? 'Auto-scrolling' : 'Paused'}
                </div>
            )}

            <div
                ref={containerRef}
                className="h-screen overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
                onMouseEnter={handleInteraction}
                onMouseLeave={handleInteraction}
                onWheel={handleInteraction}
                onTouchStart={handleInteraction}
                onTouchEnd={handleInteraction}
                onScroll={handleScroll}
            >
                <div
                    ref={contentRef}
                    className="relative"
                >
                    {children}
                </div>
            </div>
        </div>
    );
} 