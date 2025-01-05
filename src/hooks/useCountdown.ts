import { useState, useEffect } from 'react';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - Date.now();
  
  if (difference <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    hours: Math.floor(difference / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000)
  };
}