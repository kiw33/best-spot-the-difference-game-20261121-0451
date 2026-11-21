// Lantern Lane — the make.fun entrypoint (Node 22, standard library only).
//
// The game itself is plain static files under game/ (game/index.html plus
// its ES modules, no libraries, no network requests). This program is only
// the hand-in: it copies game/ and screenshots/ from beside this file into
// the output directory and writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library.
//
// Run it the way the grader does, outside the grader's container:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale screenshot or dossier can
// never ride along with a fresh build.
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps, as the kit documents them: at most 4 screenshots
// of 256 KiB each, at most 993 files / 48 MiB under game/, and a dossier of
// at most 1.5 MiB. buildDossier refuses anything the scorer would refuse.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`Lantern Lane handed in to ${out}`);
