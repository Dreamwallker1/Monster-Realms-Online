import { describe, expect, it } from 'vitest';
import {
  ELEMENTS,
  getStrengths,
  getTypeMultiplier,
  getWeaknesses,
} from '@/lib/type-chart';

describe('catalogue v3 type chart', () => {
  it('contains exactly the five active catalogue elements', () => {
    expect(ELEMENTS).toEqual(['Fire', 'Water', 'Earth', 'Storm', 'Shadow']);
  });

  it('matches the server-side elemental cycle', () => {
    expect(getTypeMultiplier('Fire', 'Earth')).toBe(2);
    expect(getTypeMultiplier('Earth', 'Storm')).toBe(2);
    expect(getTypeMultiplier('Storm', 'Water')).toBe(2);
    expect(getTypeMultiplier('Water', 'Fire')).toBe(2);
  });

  it('reports Shadow matchups consistently', () => {
    expect(getStrengths('Shadow')).toEqual(['Fire', 'Earth']);
    expect(getWeaknesses('Shadow')).toEqual(['Water', 'Storm']);
    expect(getTypeMultiplier('Shadow', 'Shadow')).toBe(0);
  });
});
