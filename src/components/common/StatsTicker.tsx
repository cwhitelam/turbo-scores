import { NFLTicker } from '../../features/sports/nfl/components/NFLTicker';
import { NBATicker } from '../../features/sports/nba/components/NBATicker';
import { NHLTicker } from '../../features/sports/nhl/components/NHLTicker';
import { MLBTicker } from '../../features/sports/mlb/components/MLBTicker';

interface StatsTickerProps {
    gameId?: string;
    className?: string;
    sport?: string;
    startTime?: string;
}

export function StatsTicker({ gameId, className = '', sport = 'NFL', startTime }: StatsTickerProps) {
    switch (sport.toUpperCase()) {
        case 'NFL':
            return <NFLTicker gameId={gameId} className={className} startTime={startTime} />;
        case 'NBA':
            return <NBATicker gameId={gameId} className={className} startTime={startTime} />;
        case 'NHL':
            return <NHLTicker gameId={gameId} className={className} startTime={startTime} />;
        case 'MLB':
            return <MLBTicker gameId={gameId} className={className} startTime={startTime} />;
        default:
            return null;
    }
} 