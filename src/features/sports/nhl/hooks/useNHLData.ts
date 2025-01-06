import { Game } from '../../../../types/game';
import { useGameData } from '../../../../hooks/game/useGameData';
import { getNHLScoreboard } from '../../../../services/nhlApi';

export function useNHLData() {
    const { games, isLoading, error } = useGameData('NHL', getNHLScoreboard);

    const processedGames = games.map((game: Game) => ({
        ...game,
        // Add any NHL-specific processing here
    }));

    return {
        games: processedGames,
        isLoading,
        error
    };
} 