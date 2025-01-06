import { describe, it, expect } from 'vitest';
import { transformSituationData } from '../../services/transformers/situationTransformer';

describe('transformSituationData', () => {
    it('should correctly transform NFL possession data', () => {
        const mockESPNSituation = {
            down: 2,
            distance: 10,
            yardLine: 25,
            possession: {
                id: '33',
                name: 'Ravens',
                displayName: 'Baltimore Ravens',
                abbreviation: 'BAL'
            },
            possessionText: '2nd & 10 at BAL 25',
            downDistanceText: '2nd & 10'
        };

        const result = transformSituationData(mockESPNSituation);

        expect(result).toEqual({
            down: 2,
            distance: 10,
            yardLine: 25,
            possession: 'Baltimore Ravens',
            possessionText: '2nd & 10 at BAL 25',
            downDistanceText: '2nd & 10'
        });
    });

    it('should handle missing possession data', () => {
        const mockESPNSituation = {
            down: 2,
            distance: 10,
            yardLine: 25,
            possession: 'BAL', // Sometimes the API might just give us the abbreviation
            possessionText: '2nd & 10 at BAL 25',
            downDistanceText: '2nd & 10'
        };

        const result = transformSituationData(mockESPNSituation);

        expect(result).toEqual({
            down: 2,
            distance: 10,
            yardLine: 25,
            possession: 'BAL',
            possessionText: '2nd & 10 at BAL 25',
            downDistanceText: '2nd & 10'
        });
    });

    it('should handle undefined situation', () => {
        const result = transformSituationData(undefined);
        expect(result).toBeUndefined();
    });
}); 