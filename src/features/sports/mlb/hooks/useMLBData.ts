import { useGameData } from '../../../../context/GameDataContext';

export function useMLBData() {
    return useGameData('MLB');
} 