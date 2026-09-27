# Demos — before/after comparison cases

Source HTML for the visual comparisons shown on skill detail pages.
Each case is a folder with a `before` (original) and an `after` (skill applied):

```
demos/
  <skill-slug>/
    <case-id>/
      before.html   # original, self-contained
      after.html    # improved with the skill, self-contained
      NOTES.md      # recipe: prompt + skill used (optional but recommended)
```

Screenshots are generated from these files into
`public/comparisons/<skill-slug>/<case-id>/{before,after}.png`
and wired through `src/data/comparisons.json` + the skill's `comparisons` array
in `src/data/registry-skills.json`. The detail page renders one slider per case;
skills with `"comparisons": []` show no slider and a dimmed icon on cards.

## Add a new comparison (5 steps)

1. **Create the case folder** with self-contained `before.html` and `after.html`
   (inline CSS/JS; remote fonts and images are fine):
   `demos/<skill-slug>/<case-id>/`
2. **Document the recipe** in `NOTES.md` (which skill + prompt produced `after.html`).
3. **Register the case** in `src/data/comparisons.json` (must match
   `src/data/comparisons.schema.json`):
   ```json
   { "id": "<case-id>", "skill": "<skill-slug>", "label": "Human readable label",
     "viewport": { "width": 1280, "height": 800 }, "fullPage": false }
   ```
   Keep `viewport` identical for before/after — it defines the slider aspect ratio.
4. **Link it from the skill** in `src/data/registry-skills.json`:
   `"comparisons": ["<case-id>"]` (first entry = primary, used for OG image).
5. **Capture the screenshots** (requires the `playwright-cli` binary):
   ```sh
   node scripts/capture-comparisons.mjs --case=<case-id>
   ```
   Re-run without flags to capture any missing/outdated case, or with `--force`
   to recapture everything. The script skips PNGs newer than their sources.

## Rules

- Never edit a generated PNG by hand — fix the HTML and re-run the script.
- Never commit a case without both PNGs: `getComparisonCases()` in
  `src/lib/skills.ts` only exposes cases whose PNGs exist on disk.
- One viewport per case; if a later case needs another size, the script
  re-resizes the browser automatically.
