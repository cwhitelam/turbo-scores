export interface GameHighlight {
  id: string;
  text: string;
  type: 'touchdown' | 'fieldgoal' | 'turnover' | 'other';
  quarter: string;
  timeLeft: string;
  team: string;
}

export interface GameHighlights {
  gameId: string;
  highlights: GameHighlight[];
}