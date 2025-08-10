import { formatPrice, formatDate, formatArea } from '../format';

describe('Format Utilities', () => {
  describe('formatPrice', () => {
    it('formats price with thousand separators', () => {
      expect(formatPrice(1000000)).toBe('1,000,000');
      expect(formatPrice(12345678)).toBe('12,345,678');
    });

    it('handles zero and undefined', () => {
      expect(formatPrice(0)).toBe('0');
      expect(formatPrice(undefined as any)).toBe('');
    });

    it('handles negative numbers', () => {
      expect(formatPrice(-1000)).toBe('-1,000');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = '2024-01-15T10:30:00Z';
      expect(formatDate(date)).toMatch(/2024/);
    });

    it('handles invalid date', () => {
      expect(formatDate('invalid')).toBe('');
    });
  });

  describe('formatArea', () => {
    it('formats area with unit', () => {
      expect(formatArea(100)).toBe('100 坪');
      expect(formatArea(50.5)).toBe('50.5 坪');
    });

    it('handles undefined', () => {
      expect(formatArea(undefined as any)).toBe('');
    });

    it('formats area range', () => {
      expect(formatArea(80, 120)).toBe('80-120 坪');
    });
  });
});