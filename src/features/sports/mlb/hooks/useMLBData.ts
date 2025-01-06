import { Game } from '../../../../types/game';
import { useGameData } from '../../../../hooks/game/useGameData';
import { getMLBScoreboard } from '../../../../services/mlbApi';

export function useMLBData() {
    const { games, isLoading, error } = useGameData('MLB', getMLBScoreboard);

    const processedGames = games.map((game: Game) => ({
        ...game,
        // Add any MLB-specific processing here
    }));

    return {
        games: processedGames,
        isLoading,
        error
    };
} 