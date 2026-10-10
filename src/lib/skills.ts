import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { marked } from 'marked';
import type { Locale } from './i18n';
import { t } from './i18n';
import registrySkillsData from '@/data/registry-skills.json';
import comparisonsData from '@/data/comparisons.json';
import { FEATURED_SLUGS, MAX_FEATURED } from '@/data/featured';

// --- Types ---

export type SkillCategory = 'css' | 'react' | 'astro' | 'tailwind' | 'tools' | 'ui-ux';
export type SkillDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Registry skill data shape (from JSON)
 */
export interface RegistrySkillData {
  title: string;
  slug: string;
  category: SkillCategory;
  description: string;
  author: string;
  featured: boolean;
  difficulty: SkillDifficulty;
  tags: string[];
  topics: string[];
  image?: string;
  /** Comparison case ids (src/data/comparisons.json). First = primary. Empty = no comparison. */
  comparisons?: string[];
  registryPath: string;
}

/**
 * Registry skill entry
 */
export interface Skill {
  id: string;
  data: RegistrySkillData;
  body: string;
}

// --- Registry Skills ---

/**
 * Read SKILL.md body content (everything after frontmatter)
 */
function skillMarkdownExists(registryPath: string): boolean {
  try {
    return existsSync(resolve(process.cwd(), registryPath));
  } catch {
    return false;
  }
}

function readSkillMarkdown(registryPath: string): string {
  try {
    const fullPath = resolve(process.cwd(), registryPath);
    if (!existsSync(fullPath)) return '';
    const raw = readFileSync(fullPath, 'utf-8');
    // Remove YAML frontmatter (between --- delimiters)
    const body = raw.replace(/^---[\s\S]*?---\n*/, '').trim();
    return body;
  } catch {
    return '';
  }
}

/**
 * Get all registry skills from JSON.
 * Memoized: SKILL.md files are static at build time, so read+parse once
 * instead of on every getAllSkills/getTopics/getRelatedSkills call.
 */
let registryCache: Skill[] | null = null;

function getRegistrySkills(): Skill[] {
  if (registryCache) return registryCache;
  // Skip registry entries whose SKILL.md no longer exists on disk,
  // so deleted skills never render as ghost cards/pages.
  registryCache = (registrySkillsData.skills || [])
    .filter((skill) => skillMarkdownExists(skill.registryPath))
    .map((skill) => ({
      id: skill.slug,
      data: skill as RegistrySkillData,
      body: readSkillMarkdown(skill.registryPath),
    }));
  return registryCache;
}

/**
 * Resolved before/after comparison case (screenshots under public/comparisons/)
 */
export interface CaseProvenance {
  model: string;
  effort?: string;
  agent?: string;
  prompt: string;
}

export interface ComparisonCase {
  id: string;
  label: string;
  before: string;
  after: string;
  width: number;
  height: number;
  /** Live full-page demo URLs (public/demos/…), for the iframe viewer. */
  demoBefore: string;
  demoAfter: string;
  beforeInfo: CaseProvenance;
  afterInfo: CaseProvenance;
}

/**
 * Read a provenance note (BEFORE.md / NOTES.md) from a demo source folder.
 * Missing files resolve to empty string — the UI hides those rows.
 */
function readCaseNote(skill: string, source: string, file: 'BEFORE.md' | 'NOTES.md'): string {
  try {
    return readFileSync(join(process.cwd(), 'demos', skill, source, file), 'utf-8').trim();
  } catch {
    return '';
  }
}

/**
 * Get a skill's comparison cases in registry order.
 * Only returns cases whose manifest entry exists AND both PNGs are on disk,
 * so missing screenshots never render as broken sliders.
 */
export function getComparisonCases(slug: string): ComparisonCase[] {
  const skill = getRegistrySkills().find((s) => s.data.slug === slug);
  const ids = new Set(skill?.data.comparisons ?? []);
  const sources = (comparisonsData as { sources?: Record<string, { before?: { model?: string; agent?: string }; after?: { model?: string; effort?: string; agent?: string } }> }).sources ?? {};
  return (comparisonsData.cases ?? [])
    .filter((c) => c.skill === slug && ids.has(c.id))
    .map((c) => {
      const src = (c as { source?: string }).source ?? c.id;
      const provenance = sources[src] ?? {};
      return {
        id: c.id,
        label: c.label,
        before: `/comparisons/${slug}/${c.id}/before.webp`,
        after: `/comparisons/${slug}/${c.id}/after.webp`,
        width: c.viewport.width,
        height: c.viewport.height,
        demoBefore: `/showcase/${slug}/${src}/before.html`,
        demoAfter: `/showcase/${slug}/${src}/after.html`,
        beforeInfo: {
          model: provenance.before?.model ?? '',
          agent: provenance.before?.agent,
          prompt: readCaseNote(slug, src, 'BEFORE.md'),
        },
        afterInfo: {
          model: provenance.after?.model ?? '',
          effort: provenance.after?.effort,
          agent: provenance.after?.agent,
          prompt: readCaseNote(slug, src, 'NOTES.md'),
        },
      };
    })
    .filter(
      (c) =>
        existsSync(join(process.cwd(), 'public', c.before)) &&
        existsSync(join(process.cwd(), 'public', c.after)),
    );
}

/**
 * Whether a skill has at least one renderable comparison case.
 */
export function hasComparisons(slug: string): boolean {
  return getComparisonCases(slug).length > 0;
}

/**
 * Render markdown body to HTML
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';
  return marked.parse(markdown) as string;
}

// --- Unified API ---

/**
 * Get all skills (registry only)
 */
export async function getAllSkills(options?: {
  category?: SkillCategory;
  difficulty?: SkillDifficulty;
  topic?: string;
  featured?: boolean;
  limit?: number;
}): Promise<Skill[]> {
  let skills = getRegistrySkills();

  if (options?.category) {
    skills = skills.filter((skill) => skill.data.category === options.category);
  }

  if (options?.difficulty) {
    skills = skills.filter((skill) => skill.data.difficulty === options.difficulty);
  }

  if (options?.topic) {
    const lowerTopic = options.topic.toLowerCase();
    skills = skills.filter((skill) =>
      skill.data.topics.some((t) => t.toLowerCase() === lowerTopic)
    );
  }

  if (options?.featured !== undefined) {
    skills = skills.filter((skill) => skill.data.featured === options.featured);
  }

  if (options?.limit) {
    skills = skills.slice(0, options.limit);
  }

  return skills;
}

/**
 * Get all skills for search
 */
export async function getAllContentSkills(): Promise<Skill[]> {
  return getRegistrySkills();
}

/**
 * Get a single skill by slug
 */
export async function getSkillBySlug(slug: string): Promise<Skill | undefined> {
  const skills = getRegistrySkills();
  return skills.find((skill) => skill.data.slug === slug);
}

/**
 * Get featured skills in curated FEATURED_SLUGS order (ui-skills style).
 * Falls back to `featured: true` flags when the curated list is empty.
 */
export function getFeaturedSkills(limit = MAX_FEATURED): Promise<Skill[]> {
  const skills = getRegistrySkills();
  const bySlug = new Map(skills.map((s) => [s.data.slug, s]));
  const curated = FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (s): s is Skill => Boolean(s),
  );
  const list = curated.length > 0
    ? curated
    : skills.filter((s) => s.data.featured);
  return Promise.resolve(list.slice(0, limit));
}

/**
 * GitHub avatar URL for an author handle (ui-skills pattern).
 * Returns empty string when the author is not a plausible GitHub handle
 * (e.g. generic labels like "community").
 */
export function getAvatarUrl(author: string, size = 80): string {
  const handle = author.trim().toLowerCase();
  if (!handle || handle === 'community' || handle.includes(' ')) return '';
  const clean = handle.replace(/^@/, '');
  if (!/^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/.test(clean)) return '';
  return `https://github.com/${clean}.png?size=${size}`;
}

/**
 * Upstream install reference per skill (appended to `skills add` commands).
 * Falls back to the legacy `front-skills@<slug>` ref for skills without one.
 */
const INSTALL_REFS: Record<string, string> = {
  'frontend-design': 'https://github.com/anthropics/skills --skill frontend-design',
  'ui-ux-pro-max': 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max',
  'web-design-guidelines': 'https://github.com/vercel-labs/agent-skills --skill web-design-guidelines',
};

/**
 * Install reference for a skill slug (used by InstallTabs on detail pages).
 */
export function getInstallRef(slug: string): string {
  return INSTALL_REFS[slug] ?? `front-skills@${slug}`;
}

/**
 * Slugify a topic for the ?topic= filter on /skills.
 */
export function topicSlug(topic: string): string {
  return topic.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Related skills scored by shared topics (+2 same author), like ui-skills.
 */
export function getRelatedSkills(slug: string, limit = 4): Promise<Skill[]> {
  const skills = getRegistrySkills();
  const current = skills.find((s) => s.data.slug === slug);
  if (!current) return Promise.resolve([]);
  const currentTopics = new Set(current.data.topics.map((x) => x.toLowerCase()));
  return Promise.resolve(
    skills
      .filter((s) => s.data.slug !== slug)
      .map((s) => {
        const shared = s.data.topics.filter((x) => currentTopics.has(x.toLowerCase())).length;
        const sameAuthor = s.data.author.toLowerCase() === current.data.author.toLowerCase() ? 2 : 0;
        const sameCategory = s.data.category === current.data.category ? 1 : 0;
        return { skill: s, score: shared * 10 + sameAuthor + sameCategory };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.skill.data.title.localeCompare(b.skill.data.title))
      .slice(0, limit)
      .map((x) => x.skill),
  );
}

/**
 * Prev/next navigation inside the same category (falls back to global list).
 */
export function getPrevNextSkills(slug: string): Promise<{ prev?: Skill; next?: Skill }> {
  const skills = getRegistrySkills();
  const current = skills.find((s) => s.data.slug === slug);
  if (!current) return Promise.resolve({});
  let list = skills.filter((s) => s.data.category === current.data.category);
  if (list.length <= 1) list = [...skills];
  const ordered = [...list].sort((a, b) => a.data.title.localeCompare(b.data.title));
  const idx = ordered.findIndex((s) => s.data.slug === slug);
  if (idx < 0) return Promise.resolve({});
  return Promise.resolve({
    prev: ordered[(idx - 1 + ordered.length) % ordered.length],
    next: ordered[(idx + 1) % ordered.length],
  });
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(category: SkillCategory): Promise<Skill[]> {
  return getAllSkills({ category });
}

/**
 * Get all unique categories with counts
 */
export async function getCategories(): Promise<{ category: SkillCategory; count: number }[]> {
  const skills = getRegistrySkills();
  const categoryMap = new Map<SkillCategory, number>();

  skills.forEach((skill) => {
    const count = categoryMap.get(skill.data.category) || 0;
    categoryMap.set(skill.data.category, count + 1);
  });

  return Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));
}

/**
 * Get all unique topics with counts
 */
export async function getTopics(): Promise<{ topic: string; count: number }[]> {
  const skills = getRegistrySkills();
  const topicMap = new Map<string, number>();

  skills.forEach((skill) => {
    skill.data.topics.forEach((topic) => {
      const count = topicMap.get(topic) || 0;
      topicMap.set(topic, count + 1);
    });
  });

  return Array.from(topicMap.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Search skills by query
 */
export async function searchSkills(query: string): Promise<Skill[]> {
  const skills = getRegistrySkills();
  const lowerQuery = query.toLowerCase();

  return skills.filter(
    (skill) =>
      skill.data.title.toLowerCase().includes(lowerQuery) ||
      skill.data.description.toLowerCase().includes(lowerQuery) ||
      skill.data.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      skill.data.topics.some((topic) => topic.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get category display info
 */
export function getCategoryInfo(category: SkillCategory, locale: Locale = 'en'): {
  label: string;
  color: string;
  icon: string;
} {
  const categories: Record<SkillCategory, { label: string; color: string; icon: string }> = {
    css: { label: t('categories.css', locale), color: 'var(--color-cat-css)', icon: 'code' },
    react: { label: t('categories.react', locale), color: 'var(--color-cat-react)', icon: 'react' },
    astro: { label: t('categories.astro', locale), color: 'var(--color-cat-astro)', icon: 'rocket' },
    tailwind: { label: t('categories.tailwind', locale), color: 'var(--color-cat-tailwind)', icon: 'wind' },
    tools: { label: t('categories.tools', locale), color: 'var(--color-cat-tools)', icon: 'wrench' },
    'ui-ux': { label: t('categories.ui-ux', locale), color: 'var(--color-cat-ui-ux)', icon: 'palette' },
  };
  return categories[category];
}
