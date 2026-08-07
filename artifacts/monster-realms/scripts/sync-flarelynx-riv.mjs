#!/usr/bin/env node
/**
 * Sync a runtime-exported Flarelynx.riv into public/rive/.
 *
 * Usage:
 *   node scripts/sync-flarelynx-riv.mjs [path/to/exported.riv]
 *
 * Default source: newest Flarelynx*.riv in the user's Downloads folder.
 * Verifies the timelines the game depends on, checks the artboard fill is
 * transparent, backs up the current asset, then copies the export in place.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targetPath = path.join(projectRoot, 'public', 'rive', 'Flarelynx.riv');

// Timelines the battle code plays (see src/lib/rive/flarelynxAnims.ts).
const REQUIRED_ANIMS = [
  'Agitated Angry Tail',
  'SIÇRAMA 2',
  'Attack_TailFire',
];

function newestDownload() {
  const dir = path.join(os.homedir(), 'Downloads');
  if (!fs.existsSync(dir)) return null;
  const candidates = fs
    .readdirSync(dir)
    .filter((f) => /^flarelynx.*\.riv$/i.test(f))
    .map((f) => path.join(dir, f))
    .map((p) => ({ p, mtime: fs.statSync(p).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return candidates[0]?.p ?? null;
}

const sourcePath = process.argv[2] ?? newestDownload();
if (!sourcePath || !fs.existsSync(sourcePath)) {
  console.error('No exported .riv found. Pass a path: node scripts/sync-flarelynx-riv.mjs <file>');
  process.exit(1);
}

const buf = fs.readFileSync(sourcePath);
if (buf.subarray(0, 4).toString('ascii') !== 'RIVE') {
  console.error(`${sourcePath} is not a .riv file (missing RIVE magic).`);
  process.exit(1);
}

let ok = true;
for (const name of REQUIRED_ANIMS) {
  const found = buf.includes(Buffer.from(name, 'utf8'));
  console.log(`${found ? 'OK  ' : 'MISS'} timeline "${name}"`);
  if (!found) ok = false;
}
if (!ok) {
  console.error('\nExport is missing required timelines — re-export from the Rive editor.');
  process.exit(1);
}

// Opaque artboard fill (#ff282828) would draw a dark rectangle behind the myth.
// Color bytes are little-endian ARGB → 28 28 28 ff.
if (buf.includes(Buffer.from([0x28, 0x28, 0x28, 0xff]))) {
  console.warn('WARN: export may contain an opaque #282828 fill — make the artboard fill alpha 0 in the editor.');
}

if (fs.existsSync(targetPath)) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${targetPath}.bak-${stamp}`;
  fs.copyFileSync(targetPath, backupPath);
  console.log(`Backed up current asset → ${path.basename(backupPath)}`);
}

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.copyFileSync(sourcePath, targetPath);
console.log(`Copied ${sourcePath} → ${path.relative(projectRoot, targetPath)}`);
