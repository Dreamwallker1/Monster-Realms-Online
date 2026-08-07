/**
 * Myth SVG art coverage tests (Myth Catalogue v3 migration, W4)
 *
 * Guards against live myths rendering as anonymous fallback blobs: before the
 * v3 migration, MYTH_ARCHETYPE mapped only deleted legacy IDs and
 * ELEMENT_BANDS omitted Earth/Storm/Shadow, so every live myth silently fell
 * back to a generic shape with Fire colors.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MYTH_ARCHETYPE, MythSvgIcon, ELEMENT_BANDS, fallback } from '@/lib/myth-svgs';

const LIVE_ELEMENTS = ['Fire', 'Water', 'Earth', 'Storm', 'Shadow'];

/** The 25 live v3 species IDs — mirrors the canonical server catalogue. */
const V3_SPECIES: Array<{ id: string; element: string }> = [
  { id: 'emberpup', element: 'Fire' },   { id: 'cinderclaw', element: 'Fire' },
  { id: 'flamewing', element: 'Fire' },  { id: 'magmahorn', element: 'Fire' },
  { id: 'pyredrake', element: 'Fire' },
  { id: 'bubblefin', element: 'Water' }, { id: 'wavecrest', element: 'Water' },
  { id: 'tidalwing', element: 'Water' }, { id: 'deepfang', element: 'Water' },
  { id: 'abyssalord', element: 'Water' },
  { id: 'pebbleback', element: 'Earth' },{ id: 'thornbriar', element: 'Earth' },
  { id: 'graniteclaw', element: 'Earth' },{ id: 'crystalhorn', element: 'Earth' },
  { id: 'terravast', element: 'Earth' },
  { id: 'zappet', element: 'Storm' },    { id: 'galecub', element: 'Storm' },
  { id: 'thunderwing', element: 'Storm' },{ id: 'stormcrown', element: 'Storm' },
  { id: 'vortexwyrm', element: 'Storm' },
  { id: 'gloomite', element: 'Shadow' }, { id: 'veilpaw', element: 'Shadow' },
  { id: 'duskfang', element: 'Shadow' }, { id: 'nightshade', element: 'Shadow' },
  { id: 'voidreign', element: 'Shadow' },
];

describe('MYTH_ARCHETYPE', () => {
  it('every live v3 myth has an explicit archetype (no fallback blob)', () => {
    for (const { id } of V3_SPECIES) {
      expect(MYTH_ARCHETYPE[id], `v3 myth "${id}" has no archetype mapping`).toBeDefined();
    }
  });
});

describe('ELEMENT_BANDS and fallback', () => {
  it('every live element has a color band (no silent Fire-band fallback)', () => {
    for (const element of LIVE_ELEMENTS) {
      expect(ELEMENT_BANDS[element], `element "${element}" has no color band`).toBeDefined();
    }
  });

  it('every live element has an intentional fallback archetype', () => {
    const distinctDefaults = new Set(LIVE_ELEMENTS.map(e => fallback(e)));
    // If an element were missing, it would collapse onto FireWolf with Fire.
    expect(distinctDefaults.size).toBe(LIVE_ELEMENTS.length);
  });
});

describe('MythSvgIcon', () => {
  it('renders an SVG body for every live v3 myth', () => {
    for (const { id, element } of V3_SPECIES) {
      const { container, unmount } = render(
        <MythSvgIcon mythId={id} element={element} rarity="C" size={64} />,
      );
      const svg = container.querySelector('svg');
      expect(svg, `"${id}" did not render an svg`).not.toBeNull();
      expect(
        svg!.querySelectorAll('path, circle, rect, ellipse, polygon').length,
        `"${id}" rendered an empty svg`,
      ).toBeGreaterThan(0);
      unmount();
    }
  });
});
