import { describe, it, expect } from 'vitest';
import { Z_INDEX } from '../types';

describe('Z-Index Layer Constants — Regression Prevention', () => {
  it('should define all required z-index layers', () => {
    expect(Z_INDEX.BASE).toBeDefined();
    expect(Z_INDEX.SIDEBAR).toBeDefined();
    expect(Z_INDEX.TOOLBAR).toBeDefined();
    expect(Z_INDEX.PANEL).toBeDefined();
    expect(Z_INDEX.DROPDOWN).toBeDefined();
    expect(Z_INDEX.MODAL).toBeDefined();
    expect(Z_INDEX.TOOLTIP).toBeDefined();
  });

  it('should have correct layer ordering (BASE < SIDEBAR < PANEL < DROPDOWN < MODAL < TOOLTIP)', () => {
    expect(Z_INDEX.BASE).toBeLessThan(Z_INDEX.SIDEBAR);
    expect(Z_INDEX.SIDEBAR).toBeLessThan(Z_INDEX.PANEL);
    expect(Z_INDEX.PANEL).toBeLessThan(Z_INDEX.DROPDOWN);
    expect(Z_INDEX.DROPDOWN).toBeLessThan(Z_INDEX.MODAL);
    expect(Z_INDEX.MODAL).toBeLessThan(Z_INDEX.TOOLTIP);
  });

  it('should have SIDEBAR and TOOLBAR at same level (both z-20)', () => {
    expect(Z_INDEX.SIDEBAR).toBe(Z_INDEX.TOOLBAR);
  });

  it('should have specific expected values', () => {
    expect(Z_INDEX.BASE).toBe(10);
    expect(Z_INDEX.SIDEBAR).toBe(20);
    expect(Z_INDEX.TOOLBAR).toBe(20);
    expect(Z_INDEX.PANEL).toBe(30);
    expect(Z_INDEX.DROPDOWN).toBe(40);
    expect(Z_INDEX.MODAL).toBe(50);
    expect(Z_INDEX.TOOLTIP).toBe(60);
  });

  it('should not have any z-index value exceeding 100 (prevents future 99999 issues)', () => {
    Object.values(Z_INDEX).forEach(value => {
      expect(value).toBeLessThanOrEqual(100);
    });
  });

  it('should have all values as integers', () => {
    Object.values(Z_INDEX).forEach(value => {
      expect(Number.isInteger(value)).toBe(true);
    });
  });
});
