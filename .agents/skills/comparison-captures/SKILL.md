---
name: comparison-captures
description: Recapture before/after demo screenshots and optimize them to WebP. Use when asked to "capturar comparaciones", "recapturar", "retomar capturas", "take comparison screenshots", "refresh section screenshots", "nuevas capturas del demo", or anything about regenerating public/comparisons images.
license: MIT
metadata:
  author: front-skills
  version: "1.0"
---

# Comparison captures

Regenerate the section screenshots that feed the before/after sliders on skill detail pages. Pipeline: Playwright capture at manifest viewport, visual verification, WebP optimization, reference consistency checks.

Source of truth: `scripts/capture-comparisons.mjs` (captures via `playwright-cli`, converts to WebP with sharp inline — no PNGs are committed). Manifest: `src/data/comparisons.json`. Skill linkage: `comparisons` array in `src/data/registry-skills.json`. Output: `public/comparisons/<skill>/<case-id>/{before,after}.webp`, wired by `getComparisonCases()` in `src/lib/skills.ts`.

## Hard constraints (repo rules)

- Only `pnpm` / `pnpm dlx`. Never `npm`, `npx`, `yarn`, `bun`.
- NEVER run `pnpm build` unless the user explicitly authorizes it in this conversation. A past one-shot authorization does not carry over.
- NEVER commit or push unless explicitly asked.
- NEVER create helper scripts inside the repo. One-off scripts go to the OS temp dir (`C:\Users\EQUIPO\AppData\Local\Temp\opencode`), never to the workspace.

## Order of operations (always in this order)

### 1. Inspect before capturing

- `git status --short`: know what is dirty. Captures overwrite files in `public/comparisons/`.
- Read `src/data/comparisons.json`: cases, each with `id`, `skill`, `source`, `anchor`, `viewport` (1280x800 standard).
- Read the skill's `comparisons` array in `src/data/registry-skills.json`: manifest cases and registry list must agree.
- Verify every case `anchor` exists as an `id` in BOTH `demos/<skill>/<source>/before.html` AND `after.html` (grep `id="..."`). Record mismatches — see pitfall below.
- Confirm `playwright-cli` resolves: `Get-Command playwright-cli`.
- List current outputs with sizes/timestamps: `Get-ChildItem -Recurse public/comparisons`.

### 2. Capture

```sh
node scripts/capture-comparisons.mjs            # missing/outdated only
node scripts/capture-comparisons.mjs --case=<id>  # single case (both sides)
node scripts/capture-comparisons.mjs --force    # everything
```

The script serves the repo over a local static server (playwright-cli blocks `file://`), waits for fonts/images/Tailwind CDN (`scripts/capture-wait.js`), screenshots at the manifest viewport, checks before/after dimensions match, and writes `{before,after}.webp` (quality 85, effort 6). Default run only recaptures stale files; use `--case` after fixing a single anchor.

### 3. Verify visually (mandatory, not optional)

Read the generated `.webp` files with the Read tool (it renders images):

- ALWAYS: `<case>/after.webp` for the hero case + every case whose anchor was missing or renamed.
- SPOT CHECK: at least 2–3 more section pairs (before + after).
- Symptom of failure: a section file showing the page hero (top-of-page fallback), or a sudden size jump (e.g. ~80 KB → ~700 KB PNG equivalent). Confirm suspicion by extracting the committed version to temp (`git show HEAD:<path>`) and viewing both.
- The after side is the priority: every after screenshot must show its own section.

### 4. Fix anchor mismatches, then recapture the case

- If `before.html` uses a different id for the same section (real example: `id="prices"` vs manifest `anchor: "pricing"`): rename the `id` in the demo fixture AND its nav `href` (`#prices` → `#pricing`). Keep visible labels untouched. Then `node scripts/capture-comparisons.mjs --case=<id>`.
- If the section genuinely does not exist on one side (real example: no testimonials in the new `before.html`): do NOT ship a fallback screenshot — a mismatched pair in a slider is misleading. STOP and ask the user: drop the case (remove from `comparisons.json` + registry `comparisons` array + delete `public/comparisons/<skill>/<id>/`) or follow their alternative.

### 5. WebP optimization

Fresh captures are already optimized by the script. Only if legacy `.png` files exist under `public/comparisons/`, convert (temp script outside the repo, sharp from the project):

```js
// run with node; createRequire targets the project so sharp resolves
const require = createRequire('C:\\Users\\EQUIPO\\Desktop\\02-proyectos\\front-skills\\package.json');
const sharp = require('sharp');
await sharp(inPng).webp({ quality: 85, effort: 6 }).toFile(outWebp);
```

Delete each PNG only after its WebP is written. Expect roughly 4–6x size reduction on UI screenshots.

### 6. Reference consistency

- `src/lib/skills.ts` `getComparisonCases()`: `before`/`after` paths must end in `.webp`; the `existsSync` filter uses the same paths — both sides must exist on disk or the case is silently dropped from the site.
- No stale references: grep `src/` for `testimonials`-style removed ids and for `comparisons/.*\.png`.
- `demos/README.md` documents the pipeline: keep extension mentions (`.webp`) and rules in sync if the workflow changes.

### 7. Final verification (no build)

- `node -e "JSON.parse(require('fs').readFileSync('src/data/comparisons.json','utf8')); ..."` → `json ok` for both JSON files.
- `git status --short`: expect `M` on edited fixtures/data/scripts, `D` on removed PNGs / deleted case folders, `??` on new WebPs. Zero `.png` under `public/comparisons/`.
- Report: per-case status, sizes before→after, any dropped/renamed case and why. Offer commit; do not commit unasked.

## Key pitfall (do not forget)

Missing anchor ids fail SILENTLY: the browser stays at the top of the page and the script still reports success with matching dimensions. A "successful" capture is not a correct capture — only visual inspection catches it. When in doubt, extract the old file from git and look at both images side by side.

## Manual file swaps

If the user asks to swap two outputs (rename only, no recapture), do it with file moves and verify by viewing both afterwards. WARNING: any later `--force` (or stale-triggered) recapture regenerates files from anchors and silently undoes the swap. Tell the user this, and if the swap must survive recaptures, fix it at the source instead (anchors/HTML) rather than swapping outputs.
