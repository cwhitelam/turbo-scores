import React, { useRef } from 'react';
import { useScrollBehavior } from '../../hooks/useScrollBehavior';
import { useAutoScrollContext } from '../../context/AutoScrollContext';

interface AutoScrollContainerProps {
    children: React.ReactNode;
    speed?: number;
    resumeDelay?: number;
}

export function AutoScrollContainer({
    children,
    speed = 50,
    resumeDelay = 5000
}: AutoScrollContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const { isAutoScrolling } = useAutoScrollContext();

    const { handleInteraction, handleScroll } = useScrollBehavior(
        containerRef,
        contentRef,
        speed,
        resumeDelay,
        isAutoScrolling
    );

    return (
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
    );
} 