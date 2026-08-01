export type PendingEncounter = {
  playerId: string;
  speciesId: string;
  regionId: string;
  wildLevel: number;
  shinyVariant: string | null;
  expiresAt: number;
};

const ENCOUNTER_TTL_MS = 5 * 60_000;
const pendingEncounters = new Map<string, PendingEncounter>();

export function rememberEncounter(encounter: Omit<PendingEncounter, "expiresAt">): void {
  pendingEncounters.set(encounter.playerId, {
    ...encounter,
    expiresAt: Date.now() + ENCOUNTER_TTL_MS,
  });
}

export function consumeEncounter(
  playerId: string,
  expected: Pick<PendingEncounter, "speciesId" | "regionId">,
): PendingEncounter | null {
  const encounter = pendingEncounters.get(playerId);
  if (!encounter) return null;
  pendingEncounters.delete(playerId);
  if (
    encounter.expiresAt <= Date.now() ||
    encounter.speciesId !== expected.speciesId ||
    encounter.regionId !== expected.regionId
  ) {
    return null;
  }
  return encounter;
}
