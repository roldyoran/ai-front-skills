# Front Skills

Astro 7 site with Svelte 5 client islands, Tailwind CSS v4, and i18n (en/es).

## Quick Commands

```sh
pnpm dev                    # dev server at localhost:4321
pnpm build                  # production build to ./dist/
```

No lint, test, or typecheck scripts are configured.

## Package Manager

- Only `pnpm` and `pnpm dlx` are allowed. Never use `npm`, `npx`, `yarn`, or `bun`.
- Do NOT run `pnpm build` unless the user explicitly asks for it.

## Architecture

- **Framework**: Astro 7 (static output) + Svelte 5 (client islands)
- **Styling**: Tailwind CSS v4 via Vite plugin, single stylesheet `src/styles/global.css` (site tokens + Starwind bridge, sectioned 1-6)
- **Content**: Skills loaded from `src/data/registry-skills.json` (metadata) + `packages/front-skills/skills-registry/*/SKILL.md` (markdown content read at build time)
- **i18n**: Astro native routing. English pages have NO prefix (`/skills`), Spanish pages use `/es/` prefix (`/es/skills`)
- **Svelte islands**: Scoped to `src/components/svelte/` only (SearchCommand, ImageComparison)
- **UI components**: Starwind UI v3 (55 styled components in `src/components/starwind/`, registry `starwind.config.json`). Always import from the local copy (`@/components/starwind/<name>`), never from `@starwind-ui/astro` directly in pages

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
- Optional: `comparison` (before/after image URLs), `image` (card cover, currently unused — cards are compact rows)

At build time, `src/lib/skills.ts` reads each SKILL.md, strips YAML frontmatter, and renders via `marked`.

## Design System

Single stylesheet `src/styles/global.css` (sections marked 1-6):
1. Site tokens under `@theme`: `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, etc. (`--font-sans` = mono stack, whole site is Geist Mono)
2. Starwind bridge (`@theme inline`): maps Starwind utilities (`bg-card`, `text-muted-foreground`...) to vars — keep in sync with CLI managed block
3. Site palette applied to Starwind vars: `:root` and `.dark` resolve to the SAME values (dark-only design, `html` always carries `.dark`)
- Sharp corners enforced by global reset (`border-radius: 0 !important`); `--radius` intentionally left valid so radius `calc()`s don't break
- Only live component classes: `.container-page`, `.page-title`, `.page-subtitle` (+ search modal, skip-link, topic-filter active pill). Buttons/cards/tags come from Starwind, not custom classes
- Always prefer the available Starwind components (`src/components/starwind/`, 55 total) over custom markup/CSS: check the local registry first before building any button, badge, card, dialog, form control, or other UI primitive from scratch. Custom UI (in `src/components/ui/` or new classes in `global.css` §5) is a last resort, only when no Starwind component fits the need
- Mobile-first: design and write all markup/CSS for small screens first, then scale up with `sm:`/`md:`/`lg:` breakpoints. Never hide essential content or actions behind desktop-only layouts — every page must be fully usable at 360px wide
- `starwind.config.json` `tailwind.css` points at `src/styles/global.css` — the CLI follows that path on future `add`/`update`

## File Organization

```
src/
├── pages/                # English pages (no prefix)
│   ├── index.astro
│   └── skills/
├── pages/es/             # Spanish pages (/es/ prefix)
│   ├── index.astro
│   └── skills/
├── layouts/              # BaseLayout (imports global.css, ThemeInitScript, global <Toaster />)
├── components/
│   ├── layout/           # Header.astro, Footer.astro (Starwind Button/Tooltip/Separator)
│   ├── ui/               # Icon (only custom UI left; badges/buttons/cards are Starwind)
│   ├── skills/           # SkillCard (compact row), SkillGrid (vertical stack),
│   │                     # TopicSelect (Starwind Select → ?topic=), InstallCommand (Input+Button+toast),
│   │                     # RelatedSkillCard (compact row)
│   ├── shared/           # SEO, SkipLink
│   ├── starwind/         # 55 local Starwind components (Button, Card, Badge, Select, Tabs,
│   │                     # Breadcrumb, Accordion, Toast, Prose, Tooltip, Avatar, ...). Owned source — editable.
│   └── svelte/           # Client-only islands (SearchCommand, ImageComparison)
├── lib/                  # skills.ts, i18n.ts, images.ts
├── data/
│   ├── registry-skills.json  # All skill metadata
│   └── i18n/{en,es}.json
└── styles/global.css     # Design tokens + component classes
```

## Gotchas

- Svelte integration is limited to `src/components/svelte/` — do not add `client:*` directives outside this directory
- Starwind interactive components (Select/Tabs/Accordion/Toast) work via the shared runtime + Astro lifecycle — no `client:*` needed for them
- Starwind `Select` must use `modal={false}` (modal mode locks body scroll and causes layout shift)
- Toasts: `toast.success()` from `@/components/starwind/toast` in `<script>` tags; `<Toaster />` already lives in BaseLayout
- Select value changes arrive as `starwind:value-change` CustomEvents on the root (see TopicSelect.astro)
- Skill cards are compact rows by design decision (homogeneous items scan better as lists) — don't reintroduce cover images without asking
- Tailwind v4 uses `@theme` blocks, not `tailwind.config.js`
- `getCategoryInfo()` and `getDifficultyInfo()` accept a `locale` parameter — always pass it
- Skill detail pages use `getStaticPaths()` — add new slugs to `registry-skills.json`
- Node >= 22.12.0 required
- Content collections are disabled (empty `collections = {}` in `src/content.config.ts`)
