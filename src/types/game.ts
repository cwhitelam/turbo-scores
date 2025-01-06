import { NHLSituation } from './nhl';

export interface TeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  score: number;
  record: string;
  winProbability?: number;
}

export interface VenueInfo {
  name: string;
  city: string;
  state: string;
}

export interface GameWeather {
  temp: number;
  condition: string;
}

export interface GamePlaySituation {
  down?: number;
  distance?: number;
  yardLine?: number;
  possession?: string;
  // NHL specific
  powerPlay?: boolean;
  strength?: string;
  lastPlay?: string;
}

export interface Game {
  id: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  venue: VenueInfo;
  weather: GameWeather;
  quarter: string;
  timeLeft: string;
  startTime: string;
  situation?: GamePlaySituation | NHLSituation;
  isUpcoming?: boolean;
  gameDate?: string;
  isSeasonOpener?: boolean;
}

export interface WinProbability {
  homeTeamId: string;
  awayTeamId: string;
  homeWinPercentage: number;
  awayWinPercentage: number;
  lastUpdated: string;
}

export interface TimeSlot {
  time: string;
  games: Game[];
}

export interface TimeSlate {
  name: string;
  games: Game[];
}