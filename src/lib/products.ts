import { getCollection, type CollectionEntry } from 'astro:content';

export type Audience = 'pf' | 'pj';

export const audienceInfo = {
  pf: { label: 'Para você', href: '/para-voce/', eyebrow: 'Seguro para você' },
  pj: { label: 'Para empresas', href: '/para-empresas/', eyebrow: 'Seguro para empresas' },
} as const;

// Listed products of an audience, in the same order as the old listing pages
export async function getProducts(audience: Audience) {
  const key = audience === 'pf' ? 'order' : 'orderPj';
  return (await getCollection('produtos', ({ data }) => data.listed && data.audience.includes(audience))).sort(
    (a, b) => a.data[key] - b.data[key] || a.data.title.localeCompare(b.data.title, 'pt-BR'),
  );
}

// Main audience of a product: business-only products belong to "Para empresas"
export const mainAudience = (p: CollectionEntry<'produtos'>): Audience =>
  p.data.audience.includes('pj') && !p.data.audience.includes('pf') ? 'pj' : 'pf';
