import { getDownAndDistance, getYardLine } from '../gameUtils';

describe('gameUtils', () => {
  describe('getDownAndDistance', () => {
    it('formats down and distance correctly', () => {
      expect(getDownAndDistance(1, 10)).toBe('1st & 10');
      expect(getDownAndDistance(4, 1)).toBe('4th & 1');
    });
  });

  describe('getYardLine', () => {
    it('formats yard line correctly', () => {
      expect(getYardLine(20)).toBe('OWN 20');
      expect(getYardLine(80)).toBe('OPP 20');
      expect(getYardLine(50)).toBe('50');
    });
  });
});