import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { t } from './i18n';
import customSkillsData from '@/data/skills.json';

export type Skill = CollectionEntry<'skills'>;
export type SkillCategory = 'css' | 'react' | 'astro' | 'tailwind' | 'tools';
export type SkillDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Custom skill type (from JSON)
 */
export interface CustomSkill {
  title: string;
  slug: string;
  category: SkillCategory;
  description: string;
  image?: string;
  comparison?: {
    before?: string;
    after?: string;
  };
  code?: string;
  tags: string[];
  featured: boolean;
  difficulty: SkillDifficulty;
}

/**
 * Get custom skills from JSON
 */
export function getCustomSkills(): CustomSkill[] {
  return customSkillsData.skills || [];
}

/**
 * Get all skills (content collection + custom)
 */
export async function getAllSkills(options?: {
  category?: SkillCategory;
  difficulty?: SkillDifficulty;
  featured?: boolean;
  limit?: number;
}): Promise<Skill[]> {
  let skills = await getCollection('skills', ({ data }) => {
    return true;
  });

  if (options?.category) {
    skills = skills.filter((skill) => skill.data.category === options.category);
  }

  if (options?.difficulty) {
    skills = skills.filter((skill) => skill.data.difficulty === options.difficulty);
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
 * Get all skills (content collection) for search
 */
export async function getAllContentSkills(): Promise<Skill[]> {
  return getCollection('skills');
}

/**
 * Get a single skill by slug
 */
export async function getSkillBySlug(slug: string): Promise<Skill | undefined> {
  const skills = await getCollection('skills');
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
  const skills = await getCollection('skills');
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
 * Search skills by query (content collection only)
 */
export async function searchSkills(query: string): Promise<Skill[]> {
  const skills = await getCollection('skills');
  const lowerQuery = query.toLowerCase();

  return skills.filter(
    (skill) =>
      skill.data.title.toLowerCase().includes(lowerQuery) ||
      skill.data.description.toLowerCase().includes(lowerQuery) ||
      skill.data.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Search custom skills by query
 */
export function searchCustomSkills(query: string): CustomSkill[] {
  const lowerQuery = query.toLowerCase();
  return getCustomSkills().filter(
    (skill) =>
      skill.title.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
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
