import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const produtos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/produtos' }),
  schema: z.object({
    title: z.string(),
    heading: z.string(),
    description: z.string().default(''),
    // pf = pessoa física ("Para você"), pj = pessoa jurídica ("Para empresas")
    audience: z.array(z.enum(['pf', 'pj'])).default([]),
    order: z.number().default(99),
    orderPj: z.number().default(99),
    // Unlisted products still get a page (keeps old URLs alive) but are hidden from listings
    listed: z.boolean().default(true),
    hero: z.string(),
    card: z.string(),
    updated: z.coerce.date().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().default(''),
    categories: z.array(z.string()).default([]),
    image: z.string().default(''),
    imageAlt: z.string().default(''),
    // Original WordPress permalink (/AAAA/MM/DD/slug/) - kept as the public URL
    legacyPath: z.string(),
  }),
});

export const collections = { produtos, blog };
