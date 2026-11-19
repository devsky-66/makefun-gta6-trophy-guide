// GTA 6 trophy guide — hand-in program (Node 22+, standard library only).
//
// What it does: copies the guide (app/) and its screenshots (screenshots/)
// from this repository into the output directory, then writes the dossier
// the judge reads (/output/dossier.json) with the vendored make.fun library.
//
// The repository root is worked out from this file's own URL, so the program
// behaves the same whatever directory it is started from. Outside the
// grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The guide itself is plain static files: app/index.html opens in a browser
// with the network off, and its trophy list and guides live in
// app/data/trophies.json. vendor/makefun-frontend.ts is the kit's copy and
// must stay unchanged — the scorer rebuilds the dossier with its own copy
// and requires a byte-for-byte match.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root: the directory holding this file, found from its URL.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader hands us a writable /output; anywhere else the environment
// variable names the directory instead.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file can never leak in.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

// The guide itself.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

// The screenshots, when the repository holds any (it always does at hand-in).
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier: the scorer's caps, so this program refuses exactly what the
// scorer would refuse (more than 4 screenshots, one over 256 KiB, app/ past
// 993 entries or 48 MiB, and a 160 KiB text cap for the judge's view).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
