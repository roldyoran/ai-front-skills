# Demos — before/after comparison cases

Source HTML for the visual comparisons shown on skill detail pages.
Each case is a folder with a `before` (original) and an `after` (skill applied):

```
demos/
  <skill-slug>/
    <source-id>/
      before.html   # original, self-contained
      after.html    # improved with the skill, self-contained
      NOTES.md      # recipe: prompt + skill used for after.html
```

Screenshots are generated from these files into
`public/comparisons/<skill-slug>/<case-id>/{before,after}.webp`
and wired through `src/data/comparisons.json` + the skill's `comparisons` array
in `src/data/registry-skills.json`. The detail page renders one slider per case;
skills with `"comparisons": []` show no slider and a dimmed icon on cards.

## Add a new comparison (5 steps)

1. **Create the source folder** with self-contained `before.html` and `after.html`
   (inline CSS/JS; remote fonts and images are fine):
   `demos/<skill-slug>/<source-id>/`. One source can feed several cases
   (e.g. one per page section).
2. **Document provenance**: `NOTES.md` (which skill + prompt produced `after.html`).
   Both are shown on the site next to each slider. If you edit any demo HTML
   afterwards, re-publish it (step 6).
3. **Register the case(s)** in `src/data/comparisons.json` (must match
   `src/data/comparisons.schema.json`):
   ```json
   { "id": "<case-id>", "skill": "<skill-slug>", "source": "<source-id>",
     "label": "Human readable label", "anchor": "<element-id>",
     "viewport": { "width": 1280, "height": 800 }, "fullPage": false }
   ```
   - `source` defaults to the case id when one folder = one case.
   - `anchor` is optional: scrolls to that element id before capturing,
     so long pages can be compared section by section.
   - Keep `viewport` identical for before/after — it defines the slider aspect ratio.
   - Shared model/effort/agent provenance goes in the top-level `sources` map
     so section cases don't repeat it (`agent` = which agent ran the model).
4. **Link it from the skill** in `src/data/registry-skills.json`:
   `"comparisons": ["<case-id>"]` (first entry = primary, used for OG image).
5. **Capture the screenshots** (requires the `playwright-cli` binary):
   ```sh
   node scripts/capture-comparisons.mjs --case=<case-id>
   ```
    Re-run without flags to capture any missing/outdated case, or with `--force`
    to recapture everything. The script skips WebPs newer than their sources
    (captures as PNG, then optimizes to WebP with sharp — no PNGs committed).

6. **Full-page routes are automatic.** `src/pages/showcase/[...path].ts` serves
   `/showcase/<skill>/<source>/{before,after}.html` for every manifest source
   (via the shared `demoResponse()` helper in `src/lib/demoEndpoint.ts`).
   No files to copy per demo — adding the manifest entry + HTML is enough.

## Rules

- Never edit a generated WebP by hand — fix the HTML and re-run the script.
- Never commit a case without both WebPs: `getComparisonCases()` in
  `src/lib/skills.ts` only exposes cases whose WebPs exist on disk.
- One viewport per case; if a later case needs another size, the script
  re-resizes the browser automatically.
