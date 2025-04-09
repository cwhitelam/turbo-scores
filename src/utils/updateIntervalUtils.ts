import { Game } from '../types/game';

// Update intervals based on game state
const ACTIVE_GAME_INTERVAL = 20000;       // 20 seconds for active games
const INACTIVE_GAME_INTERVAL = 300000;    // 5 minutes for inactive games
const UPCOMING_GAME_INTERVAL = 60000;     // 1 minute for games starting soon
const LONG_PREGAME_INTERVAL = 900000;     // 15 minutes for games far in the future
const POSTGAME_RECENT_INTERVAL = 120000;  // 2 minutes for recently finished games
const POSTGAME_OLD_INTERVAL = 1800000;    // 30 minutes for games finished a while ago
const UPCOMING_THRESHOLD = 30 * 60 * 1000; // 30 minutes threshold for "starting soon"
const POSTGAME_RECENT_THRESHOLD = 15 * 60 * 1000; // 15 minutes for "recently finished"

/**
 * Dynamically calculates the optimal polling interval based on game states
 */
export function getUpdateInterval(games: Game[]): number {
  if (!games || games.length === 0) return INACTIVE_GAME_INTERVAL;

  const now = new Date();
  let shortestInterval = INACTIVE_GAME_INTERVAL;

  // Process each game to find the appropriate update interval
  games.forEach(game => {
    const gameState = determineGameState(game, now);
    const interval = getIntervalForGameState(gameState, game, now);

    // Use the shortest interval among all games
    if (interval < shortestInterval) {
      shortestInterval = interval;
    }
  });

  return shortestInterval;
}

/**
 * Determines the current state of a game
 */
enum GameState {
  ACTIVE,
  UPCOMING_SOON,
  UPCOMING_FUTURE,
  POSTGAME_RECENT,
  POSTGAME_OLD
}

function determineGameState(game: Game, now: Date): GameState {
  // Check if game is active
  if (isGameActive(game, now)) {
    return GameState.ACTIVE;
  }

  const gameStart = parseGameTime(game.startTime);
  const timeDiff = gameStart.getTime() - now.getTime();

  // Upcoming game cases
  if (timeDiff > 0) {
    return timeDiff < UPCOMING_THRESHOLD
      ? GameState.UPCOMING_SOON
      : GameState.UPCOMING_FUTURE;
  }

  // Game has finished - check how recently
  const isRecentlyFinished = isGameRecentlyFinished(game, now);
  return isRecentlyFinished
    ? GameState.POSTGAME_RECENT
    : GameState.POSTGAME_OLD;
}

/**
 * Gets the appropriate polling interval based on game state
 */
function getIntervalForGameState(state: GameState, game: Game, now: Date): number {
  switch (state) {
    case GameState.ACTIVE:
      return ACTIVE_GAME_INTERVAL;
    case GameState.UPCOMING_SOON:
      return UPCOMING_GAME_INTERVAL;
    case GameState.UPCOMING_FUTURE:
      return LONG_PREGAME_INTERVAL;
    case GameState.POSTGAME_RECENT:
      return POSTGAME_RECENT_INTERVAL;
    case GameState.POSTGAME_OLD:
      return POSTGAME_OLD_INTERVAL;
    default:
      return INACTIVE_GAME_INTERVAL;
  }
}

/**
 * Checks if a game is currently active (in progress)
 */
function isGameActive(game: Game, now: Date): boolean {
  const gameStart = parseGameTime(game.startTime);

  // Game hasn't started yet
  if (now < gameStart) {
    return false;
  }

  // Game is over 
  if (isGameFinished(game)) {
    return false;
  }

  return true;
}

/**
 * Determines if a game is finished
 */
function isGameFinished(game: Game): boolean {
  // Check for explicit final states
  if (game.quarter === 'Final' ||
    game.quarter === 'F' ||
    game.quarter?.startsWith('F/')) {
    return true;
  }

  // Check for end of regulation or overtime with 0:00 left
  if ((game.quarter === '4Q' || game.quarter?.includes('OT')) &&
    game.timeLeft === '0:00') {
    return true;
  }

  return false;
}

/**
 * Determines if a game finished recently (within threshold)
 */
function isGameRecentlyFinished(game: Game, now: Date): boolean {
  // If we can't determine when the game finished, assume it's recent
  if (!isGameFinished(game)) return false;

  // For now, we're using a simple heuristic:
  // If the game is in the Final/OT state, it probably finished recently
  return game.quarter?.includes('OT') || game.quarter === 'Final';
}

/**
 * Parses a game time string into a Date object
 */
function parseGameTime(timeString: string): Date {
  if (!timeString ||
    timeString.toLowerCase() === 'final' ||
    timeString.toLowerCase().startsWith('final/') ||
    timeString.toLowerCase() === 'halftime') {
    return new Date();
  }

  try {
    // Handle "End of X" format
    if (timeString.toLowerCase().startsWith('end of')) {
      return new Date();
    }

    // Handle in-game time format "1:02 - 3rd" or "13:38 - 4th"
    if (timeString.includes(' - ')) {
      return new Date();
    }

    // Handle time format "1:00 PM ET"
    if (timeString.includes(':') && (timeString.includes('AM') || timeString.includes('PM'))) {
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':').map(Number);

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
    }

    // Default fallback
    return new Date();
  } catch (error) {
    console.error('Error parsing game time:', { timeString, error });
    return new Date();
  }
}