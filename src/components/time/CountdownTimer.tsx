import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  startTime: string;
}

export function CountdownTimer({ startTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function parseGameTime(timeString: string): Date {
      const today = new Date();
      const [time, period, timezone] = timeString.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      
      const gameDate = new Date(today);
      gameDate.setHours(hour24, minutes, 0, 0);
      
      // If the time has already passed today, assume it's for tomorrow
      if (gameDate < today) {
        gameDate.setDate(gameDate.getDate() + 1);
      }
      
      return gameDate;
    }

    function calculateTimeLeft() {
      const start = parseGameTime(startTime);
      const now = new Date();
      const difference = start.getTime() - now.getTime();

      if (difference <= 0) {
        return 'Starting soon...';
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}h ${minutes}m until kickoff`;
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    setTimeLeft(calculateTimeLeft()); // Initial calculation

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div className="text-white font-bold">
      {timeLeft}
    </div>
  );
}