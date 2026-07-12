import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { t } from './i18n';
import customSkillsData from '@/data/skills.json';
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
  image?: string;
  comparison?: {
    before?: string;
    after?: string;
  };
  registryPath: string;
}

/**
 * Registry skill entry (wraps data to match CollectionEntry shape)
 */
export interface RegistrySkillEntry {
  id: string;
  data: RegistrySkillData;
  body: string;
  /** Indicates this is a registry skill, not a content collection entry */
  _isRegistry: true;
}

/**
 * Unified Skill type: either a content collection entry or a registry entry
 */
export type Skill = CollectionEntry<'skills'> | RegistrySkillEntry;

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

// --- Registry Skills ---

/**
 * Convert registry JSON data to RegistrySkillEntry[]
 */
function getRegistrySkills(): RegistrySkillEntry[] {
  return (registrySkillsData.skills || []).map((skill) => ({
    id: skill.slug,
    data: skill as RegistrySkillData,
    body: '',
    _isRegistry: true as const,
  }));
}

/**
 * Check if a skill is a registry entry
 */
export function isRegistrySkill(skill: Skill): skill is RegistrySkillEntry {
  return '_isRegistry' in skill && skill._isRegistry === true;
}

// --- Custom Skills ---

/**
 * Get custom skills from JSON
 */
export function getCustomSkills(): CustomSkill[] {
  return customSkillsData.skills || [];
}

// --- Content Collection Skills (legacy) ---

async function getContentCollectionSkills(): Promise<CollectionEntry<'skills'>[]> {
  try {
    return await getCollection('skills', () => true);
  } catch {
    return [];
  }
}

// --- Unified API ---

/**
 * Get all skills (registry + content collection + custom)
 */
export async function getAllSkills(options?: {
  category?: SkillCategory;
  difficulty?: SkillDifficulty;
  featured?: boolean;
  limit?: number;
}): Promise<Skill[]> {
  const registrySkills = getRegistrySkills();
  const contentSkills = await getContentCollectionSkills();
  let skills: Skill[] = [...registrySkills, ...contentSkills];

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
 * Get all skills for search (registry + content collection)
 */
export async function getAllContentSkills(): Promise<Skill[]> {
  const registrySkills = getRegistrySkills();
  const contentSkills = await getContentCollectionSkills();
  return [...registrySkills, ...contentSkills];
}

/**
 * Get a single skill by slug
 */
export async function getSkillBySlug(slug: string): Promise<Skill | undefined> {
  const skills = await getAllSkills();
  return skills.find((skill) => skill.data.slug === slug);
}

/**
 * Get featured skills (registry first, then content collection)
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
  const skills = await getAllSkills();
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
 * Search skills by query
 */
export async function searchSkills(query: string): Promise<Skill[]> {
  const skills = await getAllSkills();
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
