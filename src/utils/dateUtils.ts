import { isPlayoffWeek } from './seasonUtils';
import { format, parse, parseISO, formatISO, isValid, addDays, isBefore } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// Default timezone (ET for US sports)
const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Game time state constants to handle various display formats
 */
const GAME_STATE = {
  FINAL: 'FINAL',
  HALFTIME: 'HALFTIME',
  UPCOMING: 'UPCOMING',
  LIVE: 'LIVE',
  POSTPONED: 'POSTPONED',
  DELAYED: 'DELAYED',
  END_OF_PERIOD: 'END_OF_PERIOD',
  PREGAME: 'PREGAME'
};

/**
 * Normalized format patterns
 */
const DATE_FORMATS = {
  API_DATE: 'yyyyMMdd',
  DISPLAY_DATE: 'MMMM d, yyyy',
  DISPLAY_TIME: 'h:mm a',
  DISPLAY_DATE_TIME: 'MMMM d, yyyy h:mm a',
  ISO_DATE: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
};

/**
 * Parse a game time string and return a Date object
 * Handles multiple time formats standardized across sports
 */
export function parseGameTime(timeString: string): Date {
  if (!timeString) {
    return new Date();
  }

  const lowerTimeString = timeString.toLowerCase();

  // Handle completed game states
  if (lowerTimeString === 'final' ||
    lowerTimeString.startsWith('final/') ||
    lowerTimeString === 'halftime' ||
    lowerTimeString.startsWith('end of')) {
    return new Date();
  }

  // Handle in-progress game states (quarter/period specific times)
  if (timeString.includes(' - ') && (
    timeString.includes('1st') ||
    timeString.includes('2nd') ||
    timeString.includes('3rd') ||
    timeString.includes('4th') ||
    timeString.includes('OT')
  )) {
    return new Date();
  }

  try {
    // Handle date format with time: "12/26 - 8:15 PM EST"
    if (timeString.includes('/') && timeString.includes('-')) {
      const [datePart, timePart] = timeString.split('-').map(s => s.trim());
      const [monthStr, dayStr] = datePart.split('/');

      // Extract time components
      let timeComponents = timePart.split(' ');
      const timeValue = timeComponents[0];
      const period = timeComponents[1]; // AM/PM
      let timezone = timeComponents[2] || 'ET'; // Default to ET if not specified

      // Map common timezone abbreviations to IANA format
      const tzMap: Record<string, string> = {
        'ET': 'America/New_York',
        'EST': 'America/New_York',
        'EDT': 'America/New_York',
        'CT': 'America/Chicago',
        'CST': 'America/Chicago',
        'CDT': 'America/Chicago',
        'MT': 'America/Denver',
        'MST': 'America/Denver',
        'MDT': 'America/Denver',
        'PT': 'America/Los_Angeles',
        'PST': 'America/Los_Angeles',
        'PDT': 'America/Los_Angeles'
      };

      // Get proper timezone
      const tzName = tzMap[timezone] || DEFAULT_TIMEZONE;

      // Build a date string in a standard format
      const currentYear = new Date().getFullYear();
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      // Create ISO-like date string
      const dateStr = `${currentYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      // Parse time with AM/PM
      let [hours, minutes] = timeValue.split(':').map(n => parseInt(n, 10));
      if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

      // Create full ISO string
      const isoString = `${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000`;

      // Parse in specified timezone
      const date = parseISO(isoString);
      if (!isValid(date)) {
        throw new Error(`Invalid date from string: ${timeString}`);
      }

      // Convert to zoned time
      return toZonedTime(date, tzName);
    }

    // Handle time format for today: "8:15 PM ET"
    if (timeString.includes(':') && (timeString.includes('AM') || timeString.includes('PM'))) {
      const parts = timeString.split(' ');
      const timeValue = parts[0];
      const period = parts[1]; // AM/PM
      let timezone = parts[2] || 'ET'; // Default to ET if not specified

      // Map timezone abbreviation to IANA format
      const tzMap: Record<string, string> = {
        'ET': 'America/New_York',
        'EST': 'America/New_York',
        'EDT': 'America/New_York',
        'CT': 'America/Chicago',
        'CST': 'America/Chicago',
        'CDT': 'America/Chicago',
        'MT': 'America/Denver',
        'MST': 'America/Denver',
        'MDT': 'America/Denver',
        'PT': 'America/Los_Angeles',
        'PST': 'America/Los_Angeles',
        'PDT': 'America/Los_Angeles'
      };

      // Get proper timezone
      const tzName = tzMap[timezone] || DEFAULT_TIMEZONE;

      // Get today's date
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      // Create ISO-like date string for today
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      // Parse time with AM/PM
      let [hours, minutes] = timeValue.split(':').map(n => parseInt(n, 10));
      if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

      // Create full ISO string
      const isoString = `${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000`;

      // Parse in specified timezone
      const date = parseISO(isoString);
      if (!isValid(date)) {
        throw new Error(`Invalid date from string: ${timeString}`);
      }

      // Convert to zoned time
      let gameDate = toZonedTime(date, tzName);

      // If the time has already passed today, assume it's for tomorrow
      if (isBefore(gameDate, new Date())) {
        gameDate = addDays(gameDate, 1);
      }

      return gameDate;
    }

    // If we can't parse the time, return current time
    return new Date();
  } catch (error) {
    console.error('Error parsing game time:', { timeString, error });
    return new Date();
  }
}

/**
 * Format date in YYYYMMDD format for API requests
 */
export function formatDate(date: Date): string {
  return format(date, DATE_FORMATS.API_DATE);
}

/**
 * Format date for display with time zone awareness
 */
export function formatDisplayDate(date: Date, timezone: string = DEFAULT_TIMEZONE): string {
  try {
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, DATE_FORMATS.DISPLAY_DATE);
  } catch (error) {
    console.error('Error formatting display date:', { date, error });
    return format(date, DATE_FORMATS.DISPLAY_DATE);
  }
}

/**
 * Format time for display in local time
 */
export function formatDisplayTime(date: Date, timezone: string = DEFAULT_TIMEZONE): string {
  try {
    return formatInTimeZone(date, timezone, DATE_FORMATS.DISPLAY_TIME);
  } catch (error) {
    console.error('Error formatting display time:', { date, error });
    return format(date, DATE_FORMATS.DISPLAY_TIME);
  }
}

/**
 * Format full date and time for display with timezone
 */
export function formatDisplayDateTime(date: Date, timezone: string = DEFAULT_TIMEZONE): string {
  try {
    return formatInTimeZone(date, timezone, DATE_FORMATS.DISPLAY_DATE_TIME);
  } catch (error) {
    console.error('Error formatting display date time:', { date, error });
    return format(date, DATE_FORMATS.DISPLAY_DATE_TIME);
  }
}

/**
 * Get timezone abbreviation (ET, CT, etc.) from timezone name
 */
export function getTimezoneAbbreviation(timezone: string = DEFAULT_TIMEZONE): string {
  const timeZoneAbbreviations: Record<string, string> = {
    'America/New_York': 'ET',
    'America/Chicago': 'CT',
    'America/Denver': 'MT',
    'America/Los_Angeles': 'PT',
    'America/Phoenix': 'MST',
    'America/Anchorage': 'AKT',
    'America/Honolulu': 'HST'
  };

  return timeZoneAbbreviations[timezone] || 'ET';
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Compare two game times for sorting
 */
export function compareGameTimes(timeA: string, timeB: string): number {
  const dateA = parseGameTime(timeA);
  const dateB = parseGameTime(timeB);
  return dateA.getTime() - dateB.getTime();
}

/**
 * Standardize FINAL text capitalization to ensure consistency
 */
export function standardizeFinalCapitalization(displayText: string): string {
  if (typeof displayText !== 'string') return '';

  // Replace "Final" with "FINAL" while preserving any suffixes 
  return displayText.replace(/Final(\/[A-Z0-9]+)?/g, (match) => {
    return match.toUpperCase();
  });
}