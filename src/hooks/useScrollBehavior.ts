import { useEffect, RefObject, useState, useCallback, useRef } from 'react';

export function useScrollBehavior(
  containerRef: RefObject<HTMLDivElement>,
  contentRef: RefObject<HTMLDivElement>,
  speed: number,
  resumeDelay: number,
  isAutoScrollEnabled: boolean
) {
  const [userInteracting, setUserInteracting] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollPositionRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Smooth scrolling animation
  const animateScroll = useCallback((timestamp: number) => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;

    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const progress = timestamp - startTimeRef.current;

    // Calculate scroll position based on time, adding the last position for continuity
    const scrollPos = (progress * speed / 1000) % (content.scrollHeight - container.clientHeight);

    // Apply smooth scrolling
    container.scrollTop = scrollPos;

    // Store current position for later resume
    lastScrollPositionRef.current = scrollPos;

    // Continue animation
    animationFrameIdRef.current = requestAnimationFrame(animateScroll);
  }, [containerRef, contentRef, speed]);

  // Start or stop auto-scrolling
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;

    // Start auto-scrolling if enabled and user isn't interacting
    if (isAutoScrollEnabled && !userInteracting) {
      startTimeRef.current = null; // Reset timing on each enable
      animationFrameIdRef.current = requestAnimationFrame(animateScroll);
    } else if (animationFrameIdRef.current) {
      // Stop auto-scrolling
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };
  }, [isAutoScrollEnabled, userInteracting, animateScroll, containerRef, contentRef]);

  // Handle user interaction with scroll container
  const handleInteraction = useCallback((event: React.MouseEvent | React.TouchEvent | React.WheelEvent) => {
    const isStartEvent = event.type === 'mouseenter' || event.type === 'touchstart' || event.type === 'wheel';

    // Set user interaction state
    setUserInteracting(isStartEvent);

    // Clear any existing timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }

    // Set a timeout to resume auto-scrolling
    if (!isStartEvent && isAutoScrollEnabled) {
      resumeTimeoutRef.current = setTimeout(() => {
        setUserInteracting(false);
      }, resumeDelay);
    }
  }, [isAutoScrollEnabled, resumeDelay]);

  // Handle manual scrolling
  const handleScroll = useCallback(() => {
    if (!containerRef.current || userInteracting) return;

    // Store current scroll position
    lastScrollPositionRef.current = containerRef.current.scrollTop;
  }, [containerRef, userInteracting]);

  return {
    handleInteraction,
    handleScroll,
    isScrolling: isAutoScrollEnabled && !userInteracting
  };
}