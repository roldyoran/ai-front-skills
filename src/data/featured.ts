/**
 * Curated home list — same idea as ui-skills FEATURED_PATH_SLUGS.
 * Explicit order, stable between deploys. Edit this file to curate the home.
 * Slugs must exist in registry-skills.json.
 */
export const FEATURED_SLUGS = [
  "frontend-design",
  "ui-ux-pro-max",
  "web-design-guidelines",
] as const;

export const MAX_FEATURED = 3;
