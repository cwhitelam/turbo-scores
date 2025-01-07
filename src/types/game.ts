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
  // NFL specific
  down?: number;
  distance?: number;
  yardLine?: number;
  possession?: string;
  possessionText?: string;
  downDistanceText?: string;

  // NHL specific
  powerPlay?: boolean;
  strength?: string;
  lastPlay?: string;

  // NBA specific
  shotClock?: number;
  inBonus?: boolean;

  // MLB specific
  balls?: number;
  strikes?: number;
  outs?: number;
  onFirst?: boolean;
  onSecond?: boolean;
  onThird?: boolean;
  onBase?: boolean;
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

export interface StatLeader {
  name: string;
  stat: string;
  detail?: string;
  team: string;
  headshot?: string;
}

export interface GameStats {
  // NFL Leaders
  passer?: StatLeader;
  rusher?: StatLeader;
  receiver?: StatLeader;

  // NBA Leaders
  scorer?: StatLeader;
  rebounder?: StatLeader;
  assister?: StatLeader;

  // MLB Leaders (TODO)
  pitcher?: StatLeader;
  batter?: StatLeader;

  // NHL Leaders (TODO)
  goalScorer?: StatLeader;
  assists?: StatLeader;
  goalie?: StatLeader;
}