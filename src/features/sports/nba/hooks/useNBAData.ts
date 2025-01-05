import { useGameData } from '../../../../context/GameDataContext';

export function useNBAData() {
    return useGameData('NBA');
} 