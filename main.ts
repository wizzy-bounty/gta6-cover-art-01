// main.ts — Vice Coast Studio entrypoint (Node 22, standard library only).
// Copies app/ and screenshots/ from this repository into the output directory
// and writes /output/dossier.json with buildDossier from vendor/makefun-app.ts.
// Runs twice in grading; both runs write the same bytes.

import { buildDossier } from './vendor/makefun-app.ts';
import {
  copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyTree(srcDir: string, dstDir: string): void {
  mkdirSync(dstDir, { recursive: true });
  const entries = readdirSync(srcDir, { withFileTypes: true });
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    const src = join(srcDir, entry.name);
    const dst = join(dstDir, entry.name);
    if (entry.isDirectory()) {
      copyTree(src, dst);
    } else if (entry.isFile()) {
      copyFileSync(src, dst);
    } else {
      throw new Error(`main.ts: refusing non-regular entry ${src}`);
    }
  }
}

function main(): void {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const appDir = join(repoRoot, 'app');
  const shotsDir = join(repoRoot, 'screenshots');
  if (!statSync(appDir).isDirectory()) throw new Error('main.ts: app/ is missing');
  if (!statSync(shotsDir).isDirectory()) throw new Error('main.ts: screenshots/ is missing');
  copyTree(appDir, join(outDir, 'app'));
  copyTree(shotsDir, join(outDir, 'screenshots'));
  const dossier = buildDossier(outDir, CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log(`main.ts: wrote ${outDir} (dossier ${dossier.length} bytes)`);
}

main();
