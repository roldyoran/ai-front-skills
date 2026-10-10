# AI Front Skills

A skills registry website built with Astro 7, featuring visual before/after comparisons for frontend development skills.

## Features

- **Skills Registry** — Browse frontend skills with visual comparisons
- **Topic Filtering** — Filter skills by topics (Visual, Systems, Motion, etc.)
- **Full-text Search** — Search skills by title, description, tags, or topics
- **i18n** — English and Spanish language support
- **Dark Theme** — Monospace design with sharp corners

## Tech Stack

- [Astro 7](https://astro.build/) — Static site generation
- [Svelte 5](https://svelte.dev/) — Client islands (search, comparisons)
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling via Vite plugin
- [marked](https://marked.js.org/) — Markdown rendering for skill content

## Getting Started

```sh
pnpm install
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321)

## Project Structure

```
src/
├── pages/            # Route pages (en/es)
├── components/       # UI components
├── lib/              # Utilities (skills, i18n, images)
├── data/             # Skill metadata, i18n strings
└── styles/           # Design tokens, global CSS

packages/front-skills/skills-registry/  # Skill SKILL.md files
```

## Adding Skills

1. Create a new folder in `packages/front-skills/skills-registry/`
2. Add a `SKILL.md` file with the skill content
3. Add an entry to `src/data/registry-skills.json` with metadata:
   ```json
   {
     "title": "My Skill",
     "slug": "my-skill",
     "category": "css",
     "description": "Brief description",
     "author": "yourname",
     "featured": false,
     "difficulty": "beginner",
     "tags": ["tag1", "tag2"],
     "topics": ["Visual", "Systems"],
     "registryPath": "packages/front-skills/skills-registry/my-skill/SKILL.md"
   }
   ```

## Build

```sh
pnpm build
```

Output goes to `./dist/`

## License

MIT
