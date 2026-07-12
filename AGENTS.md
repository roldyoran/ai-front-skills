# Front Skills

Astro 7 site with Svelte 5 client islands, Tailwind CSS v4, and i18n (en/es).

## Quick Commands

```sh
pnpm dev                    # dev server at localhost:4321
pnpm build                  # production build to ./dist/
```

No lint, test, or typecheck scripts are configured. Verify changes with `pnpm build`.

## Architecture

- **Framework**: Astro 7 (static output) + Svelte 5 (client islands)
- **Styling**: Tailwind CSS v4 via Vite plugin, design tokens in `src/styles/global.css`
- **Content**: Skills loaded from `src/data/registry-skills.json` (metadata) + `packages/front-skills/skills-registry/*/SKILL.md` (markdown content read at build time)
- **i18n**: Astro native routing. English pages have NO prefix (`/skills`), Spanish pages use `/es/` prefix (`/es/skills`)
- **Svelte islands**: Scoped to `src/components/svelte/` only (SearchCommand, ImageComparison, CopyButton)

## Path Alias

`@/` → `src/` (configured in both `tsconfig.json` and `astro.config.mjs` vite alias).

## i18n Routing

- English: `/skills`, `/` (no locale prefix)
- Spanish: `/es/skills`, `/es/`

`getLocaleFromPath()` and `getAlternateLocaleUrl()` in `src/lib/i18n.ts` handle detection and switching.

## Skills System

All skills are defined in `src/data/registry-skills.json`. Each entry has:
- Metadata: `title`, `slug`, `category`, `author`, `tags`, `topics`, `difficulty`, `featured`
- `registryPath`: points to a `SKILL.md` file under `packages/front-skills/skills-registry/`
- Optional: `comparison` (before/after image URLs)

At build time, `src/lib/skills.ts` reads each SKILL.md, strips YAML frontmatter, and renders via `marked`.

## Design System

Tokens in `src/styles/global.css` under `@theme`:
- Colors: `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, etc.
- Component classes: `.container-page`, `.card`, `.btn-primary`, `.btn-secondary`, `.topic-pill`
- Global reset: `border-radius: 0 !important` on all elements (sharp corners)

## File Organization

```
src/
├── pages/                # English pages (no prefix)
│   ├── index.astro
│   └── skills/
├── pages/es/             # Spanish pages (/es/ prefix)
│   ├── index.astro
│   └── skills/
├── components/
│   ├── layout/           # Header.astro, Footer.astro
│   ├── ui/               # Icon, PageHeader, TopicFilter, FilterButton
│   ├── skills/           # SkillCard, SkillGrid
│   ├── shared/           # SEO, SkipLink
│   └── svelte/           # Client-only islands (SearchCommand, ImageComparison, CopyButton)
├── lib/                  # skills.ts, i18n.ts, images.ts
├── data/
│   ├── registry-skills.json  # All skill metadata
│   └── i18n/{en,es}.json
└── styles/global.css     # Design tokens + component classes
```

## Gotchas

- Svelte integration is limited to `src/components/svelte/` — do not add `client:*` directives outside this directory
- Tailwind v4 uses `@theme` blocks, not `tailwind.config.js`
- `getCategoryInfo()` and `getDifficultyInfo()` accept a `locale` parameter — always pass it
- Skill detail pages use `getStaticPaths()` — add new slugs to `registry-skills.json`
- Node >= 22.12.0 required
- Content collections are disabled (empty `collections = {}` in `src/content.config.ts`)
