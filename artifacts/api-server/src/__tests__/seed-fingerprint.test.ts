/**
 * Seed fingerprint regression tests (Myth Catalogue v3 migration, W0)
 *
 * Guards the exact bug where seedOnStartup fingerprinted regions by ID only,
 * so editing a region's monsterSpeciesIds never triggered a re-seed on
 * existing databases and stale legacy spawn pools survived deploys.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

// @workspace/db throws at import time without DATABASE_URL. The pg Pool is
// lazy (no connection is opened), so a placeholder is safe for pure-function
// tests. Must be set before the dynamic import below.
process.env.DATABASE_URL ??= "postgresql://unused:unused@127.0.0.1:5432/unused";

const { regionFingerprint } = await import("../lib/seedOnStartup.js");

describe("regionFingerprint", () => {
  it("changes when a region's spawn pool changes but region IDs are identical", () => {
    const before = regionFingerprint([
      { id: "verdant-meadows", monsterSpeciesIds: ["leaflet", "sprouti"] },
      { id: "volcanic-rift", monsterSpeciesIds: ["sparkub"] },
    ]);
    const after = regionFingerprint([
      { id: "verdant-meadows", monsterSpeciesIds: ["pebbleback", "thornbriar"] },
      { id: "volcanic-rift", monsterSpeciesIds: ["emberpup"] },
    ]);
    assert.notEqual(before, after);
  });

  it("is stable across row order and pool order (no reseed loop on every boot)", () => {
    const a = regionFingerprint([
      { id: "volcanic-rift", monsterSpeciesIds: ["emberpup", "cinderclaw"] },
      { id: "verdant-meadows", monsterSpeciesIds: ["pebbleback", "terravast"] },
    ]);
    const b = regionFingerprint([
      { id: "verdant-meadows", monsterSpeciesIds: ["terravast", "pebbleback"] },
      { id: "volcanic-rift", monsterSpeciesIds: ["cinderclaw", "emberpup"] },
    ]);
    assert.equal(a, b);
  });

  it("changes when a region is added or removed", () => {
    const one = regionFingerprint([
      { id: "volcanic-rift", monsterSpeciesIds: ["emberpup"] },
    ]);
    const two = regionFingerprint([
      { id: "volcanic-rift", monsterSpeciesIds: ["emberpup"] },
      { id: "void-realm", monsterSpeciesIds: ["voidreign"] },
    ]);
    assert.notEqual(one, two);
  });

  it("distinguishes an empty pool from a missing region", () => {
    const emptyPool = regionFingerprint([
      { id: "volcanic-rift", monsterSpeciesIds: [] },
    ]);
    const nothing = regionFingerprint([]);
    assert.notEqual(emptyPool, nothing);
  });
});
