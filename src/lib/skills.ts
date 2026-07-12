import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { marked } from 'marked';
import type { Locale } from './i18n';
import { t } from './i18n';
import registrySkillsData from '@/data/registry-skills.json';

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
  comparison?: {
    before?: string;
    after?: string;
  };
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
function readSkillMarkdown(registryPath: string): string {
  try {
    const fullPath = resolve(process.cwd(), registryPath);
    const raw = readFileSync(fullPath, 'utf-8');
    // Remove YAML frontmatter (between --- delimiters)
    const body = raw.replace(/^---[\s\S]*?---\n*/, '').trim();
    return body;
  } catch {
    return '';
  }
}

/**
 * Get all registry skills from JSON
 */
function getRegistrySkills(): Skill[] {
  return (registrySkillsData.skills || []).map((skill) => ({
    id: skill.slug,
    data: skill as RegistrySkillData,
    body: readSkillMarkdown(skill.registryPath),
  }));
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
 * Get featured skills
 */
export async function getFeaturedSkills(limit = 6): Promise<Skill[]> {
  return getAllSkills({ featured: true, limit });
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

/**
 * Get difficulty display info
 */
export function getDifficultyInfo(difficulty: SkillDifficulty, locale: Locale = 'en'): {
  label: string;
  color: string;
} {
  const difficulties: Record<SkillDifficulty, { label: string; color: string }> = {
    beginner: { label: t('skills.difficulty.beginner', locale), color: 'var(--color-success)' },
    intermediate: { label: t('skills.difficulty.intermediate', locale), color: 'var(--color-warning)' },
    advanced: { label: t('skills.difficulty.advanced', locale), color: 'var(--color-error)' },
  };
  return difficulties[difficulty];
}
