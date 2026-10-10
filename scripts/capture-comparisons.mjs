#!/usr/bin/env node
/**
 * Capture before/after screenshots for comparison cases.
 *
 * Reads src/data/comparisons.json, renders each demos/<skill>/<id>/{before,after}.html
 * in Chromium at the manifest viewport, and saves optimized WebP files to
 * public/comparisons/<skill>/<id>/{before,after}.webp
 *
 * Requires the `playwright-cli` binary on PATH (browsers already installed).
 *
 * Usage:
 *   node scripts/capture-comparisons.mjs            # capture missing/outdated only
 *   node scripts/capture-comparisons.mjs --force    # recapture everything
 *   node scripts/capture-comparisons.mjs --case=hair-salon
 */
import { execFile } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'comparisons.json');
const PW = 'playwright-cli';
const SESSION = 'capture';
const CALL_TIMEOUT = 120_000;

// Wait for webfonts + images + Tailwind CDN JIT to settle (single function expression file).
const WAIT_FILE = join(ROOT, 'scripts', 'capture-wait.js');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

/** Minimal static server (playwright-cli blocks file:// URLs). */
function startServer(root) {
  return new Promise((resolveServer) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        const file = resolve(root, `.${urlPath}`);
        if (file !== root && !file.startsWith(root + sep)) {
          res.writeHead(403);
          res.end();
          return;
        }
        const data = await readFile(file);
        res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => resolveServer(server));
  });
}

function pw(args) {
  return execFileAsync(PW, ['--raw', `-s=${SESSION}`, ...args], {
    cwd: ROOT,
    timeout: CALL_TIMEOUT,
    maxBuffer: 8 * 1024 * 1024,
    shell: process.platform === 'win32',
  });
}

function mtime(p) {
  try {
    return statSync(p).mtimeMs;
  } catch {
    return 0;
  }
}

/** Read PNG dimensions from the IHDR chunk (no deps). */
function pngSize(p) {
  try {
    const buf = readFileSync(p);
    if (buf.length < 26 || buf.readUInt32BE(0) !== 0x89504e47) return null;
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}

async function captureSide({ skill, id, source, anchor, side, viewport, force }) {
  const src = source ?? id;
  const htmlPath = join(ROOT, 'demos', skill, src, `${side}.html`);
  if (!existsSync(htmlPath)) {
    console.error(`  ✖ missing source: demos/${skill}/${src}/${side}.html`);
    return false;
  }
  const outDir = join(ROOT, 'public', 'comparisons', skill, id);
  const outPath = join(outDir, `${side}.webp`);
  const manifestTime = mtime(MANIFEST_PATH);
  if (!force && existsSync(outPath) && mtime(outPath) > Math.max(mtime(htmlPath), manifestTime)) {
    console.log(`  • ${side}.webp up to date, skipping`);
    return true;
  }
  mkdirSync(outDir, { recursive: true });
  const hash = anchor ? `#${anchor}` : '';
  const url = `${globalThis.__CAPTURE_BASE__}/demos/${skill}/${src}/${side}.html${hash}`;
  await pw(['goto', url]);
  const { stdout } = await pw(['run-code', `--filename=${WAIT_FILE}`]);
  if (!stdout.includes('ready')) {
    console.error(`  ✖ page never settled: ${skill}/${id}/${side}`);
    return false;
  }
  // Screenshots land as PNG first, then convert to optimized WebP (no PNGs committed).
  const tmpPng = join(outDir, `${side}.tmp.png`);
  await pw(['screenshot', `--filename=${tmpPng}`]);
  const size = pngSize(tmpPng);
  if (!size) {
    rmSync(tmpPng, { force: true });
    console.error(`  ✖ could not read screenshot: ${skill}/${id}/${side}`);
    return false;
  }
  await sharp(tmpPng).webp({ quality: 85, effort: 6 }).toFile(outPath);
  rmSync(tmpPng, { force: true });
  console.log(`  ✔ ${side}.webp (${size.width}x${size.height})`);
  return size;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const onlyCase = args.find((a) => a.startsWith('--case='))?.split('=')[1];

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  const cases = manifest.cases.filter((c) => !onlyCase || c.id === onlyCase);
  if (cases.length === 0) {
    console.error(onlyCase ? `No case "${onlyCase}" in manifest.` : 'Manifest has no cases.');
    process.exit(1);
  }

  // Static server for the demos + fresh browser; viewport set before first navigation.
  const server = await startServer(ROOT);
  __server = server;
  globalThis.__CAPTURE_BASE__ = `http://127.0.0.1:${server.address().port}`;
  try {
    await pw(['close']);
  } catch {
    /* no previous session */
  }
  const { width, height } = cases[0].viewport;
  await pw(['open', 'about:blank']);
  await pw(['resize', String(width), String(height)]);

  let failed = 0;
  for (const c of cases) {
    console.log(`\n${c.skill}/${c.id} (${c.viewport.width}x${c.viewport.height})`);
    // Re-resize if a later case uses a different viewport.
    if (c.viewport.width !== width || c.viewport.height !== height) {
      await pw(['resize', String(c.viewport.width), String(c.viewport.height)]);
    }
    const before = await captureSide({ ...c, side: 'before', force });
    const after = await captureSide({ ...c, side: 'after', force });
    if (!before || !after) {
      failed++;
    } else if (before.width !== after.width || before.height !== after.height) {
      console.error(
        `  ✖ dimension mismatch: before ${before.width}x${before.height} vs ` +
          `after ${after.width}x${after.height} — the slider will crop one side`,
      );
      failed++;
    }
  }

  try {
    await pw(['close']);
  } catch {
    /* already closed */
  }
  await new Promise((res) => server.close(res));
  if (failed > 0) process.exit(1);
  console.log('\nDone.');
}

let __server = null;
main().catch(async (err) => {
  console.error(err?.stderr || err?.message || err);
  try {
    await execFileAsync(PW, ['--raw', `-s=${SESSION}`, 'close'], {
      cwd: ROOT,
      shell: process.platform === 'win32',
    });
  } catch {
    /* already closed */
  }
  if (__server) await new Promise((res) => __server.close(res));
  process.exit(1);
});
