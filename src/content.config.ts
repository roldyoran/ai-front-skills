import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const skills = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/skills' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    category: z.enum(['css', 'react', 'astro', 'tailwind', 'tools']),
    tags: z.array(z.string()).default([]),
    author: z.string().default('front-skills'),
    featured: z.boolean().default(false),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    agents: z.array(z.string()).default([]),
    image: z.string().optional(),
    comparison: z
      .object({
        before: z.string().optional(),
        after: z.string().optional(),
      })
      .optional(),
    description: z.string(),
  }),
});

export const collections = { skills };
