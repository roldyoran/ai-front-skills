# Front Skills

Astro 7 site with React 19 components, Tailwind CSS v4, MDX content, and i18n (en/es).

## Quick Commands

```sh
pnpm dev                    # dev server at localhost:4321
pnpm build                  # production build to ./dist/
pnpm exec astro dev --background   # background mode
pnpm exec astro dev stop    # stop background server
```

No lint, test, or typecheck scripts are configured. Verify changes with `pnpm build`.

## Architecture

- **Framework**: Astro 7 (static output) + Svelte 5 (client islands)
- **Styling**: Tailwind CSS v4 via Vite plugin, design tokens in `src/styles/global.css`
- **Content**: Astro Content Collections (`src/content/skills/*.md` and `./skills/**/SKILL.md`) + custom JSON (`src/data/skills.json`)
- **i18n**: Astro native routing, both locales prefixed (`/en/*`, `/es/*`), default `en`
- **Svelte islands**: Scoped to `src/components/svelte/` only (SearchCommand, ImageComparison, CopyButton)

## Path Alias

`@/` → `src/` (configured in both `tsconfig.json` and `astro.config.mjs` vite alias).

## i18n Routing

Both locales use URL prefixes. All internal links must include the locale prefix:
- English: `/en/skills`, `/en/categories`
- Spanish: `/es/skills`, `/es/categories`

`getLocaleFromPath()` and `getAlternateLocaleUrl()` in `src/lib/i18n.ts` handle detection and switching. Use them, never hardcode locale logic.

## Content Collections

Skills are defined in `src/content.config.ts` with Zod schema. Key fields: `title`, `slug`, `category`, `author`, `tags`, `difficulty`, `featured`, `image`, `comparison`.

Custom skills live in `src/data/skills.json` (merged at runtime by `src/lib/skills.ts`).

## Design System

Tokens in `src/styles/global.css` under `@theme`:
- Colors: `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, etc.
- Component classes: `.container-page`, `.card`, `.btn-primary`, `.btn-secondary`, `.tag`
- Global reset: `border-radius: 0 !important` on all elements

## File Organization

```
src/
├── pages/{en,es}/     # i18n pages (symmetrical structure)
├── components/
│   ├── layout/        # Header, Footer
│   ├── ui/            # Badge, Icon, PageHeader, FilterButton
│   ├── skills/        # SkillCard, SkillGrid, RelatedSkillCard
│   ├── shared/        # SEO, SkipLink
│   └── svelte/        # Client-only islands (SearchCommand, ImageComparison, CopyButton)
├── lib/               # skills.ts, i18n.ts, images.ts
├── data/              # skills.json, i18n/{en,es}.json
├── content/skills/    # MDX skill articles
└── styles/global.css  # Design tokens + component classes
```

## Gotchas

- Svelte integration is limited to `src/components/svelte/` — do not add `client:*` directives outside this directory
- Tailwind v4 uses `@theme` blocks, not `tailwind.config.js`
- `getCategoryInfo()` and `getDifficultyInfo()` accept a `locale` parameter — always pass it
- Skill detail pages use `getStaticPaths()` — add new slugs to content collection or `skills.json`
- Node >= 22.12.0 required
