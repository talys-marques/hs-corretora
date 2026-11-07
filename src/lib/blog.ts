import { getCollection, type CollectionEntry } from 'astro:content';

// Posts keep their WordPress permalink (/AAAA/MM/DD/slug/), decoded so the build writes
// real folder names (one slug contains an emoji).
export const postPath = (post: CollectionEntry<'blog'>) => decodeURIComponent(post.data.legacyPath).replace(/^\/|\/$/g, '');

export const postUrl = (post: CollectionEntry<'blog'>) => `/${postPath(post)}/`;

export async function getPosts() {
  return (await getCollection('blog')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const formatDate = (date: Date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
