/* Yard notes: posts in order, their addresses, dates and reading time. Shared by
   /journal/, each post, the service pages and the sitemap. */

import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Newest first. */
export async function posts(): Promise<Post[]> {
  const all = await getCollection('blog');
  return all.sort((a, b) => b.data.published.localeCompare(a.data.published) || a.id.localeCompare(b.id));
}

export const postPath = (p: Post) => `/journal/${p.id}/`;

/** Words in the post at about 220 a minute, rounded. */
export function minutes(p: Post): number {
  const d = p.data;
  const parts = [
    d.lede,
    ...d.short,
    ...d.sections.flatMap((s) => [s.h, ...s.p, ...s.list, ...s.after, ...(s.table ? [...s.table.head, ...s.table.rows.flat(), s.table.note ?? ''] : [])]),
  ];
  return Math.max(1, Math.round(parts.join(' ').split(/\s+/).length / 220));
}

/** "2026-10-23" as "October 23, 2026". */
export function dateLabel(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
