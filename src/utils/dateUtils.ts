import { isPlayoffWeek } from './seasonUtils';

// Date parsing and formatting
export function parseGameTime(timeString: string): Date {
  // Handle final game states
  if (!timeString ||
    timeString.toLowerCase() === 'final' ||
    timeString.toLowerCase() === 'final/ot') {
    return new Date();
  }

  try {
    // Handle "End of X" format
    if (timeString.toLowerCase().startsWith('end of')) {
      return new Date();
    }

    // Handle in-game time format "1:02 - 3rd" or "13:38 - 4th"
    if (timeString.includes(' - ') && (
      timeString.includes('1st') ||
      timeString.includes('2nd') ||
      timeString.includes('3rd') ||
      timeString.includes('4th') ||
      timeString.includes('OT')
    )) {
      // For in-game times, we'll return the current time since these
      // are live game times, not future start times
      return new Date();
    }

    // Handle date format "12/26 - 8:15 PM EST"
    if (timeString.includes('/')) {
      const [datePart, timePart] = timeString.split('-').map(s => s.trim());
      const [month, day] = datePart.split('/').map(Number);
      const [time, period] = timePart.split(' ');
      const [hours, minutes] = time.split(':').map(Number);

      if (isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
        throw new Error(`Invalid date/time format: ${timeString}`);
      }

      // Convert to 24-hour format
      let hour24 = hours;
      if (period.startsWith('PM') && hours !== 12) hour24 += 12;
      if (period.startsWith('AM') && hours === 12) hour24 = 0;

      const now = new Date();
      const year = now.getFullYear();

      // Create date with the specified components
      return new Date(year, month - 1, day, hour24, minutes, 0);
    }

    // Handle legacy format "1:00 PM ET"
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Invalid time format: ${timeString}`);
    }

    let hour24 = hours;
    if (period.startsWith('PM') && hours !== 12) hour24 += 12;
    if (period.startsWith('AM') && hours === 12) hour24 = 0;

    const now = new Date();
    const gameDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour24,
      minutes,
      0
    );

    // If the time has already passed today, assume it's for tomorrow
    if (gameDate < now) {
      gameDate.setDate(gameDate.getDate() + 1);
    }

    return gameDate;
  } catch (error) {
    console.error('Error parsing game time:', { timeString, error });
    return new Date();
  }
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}