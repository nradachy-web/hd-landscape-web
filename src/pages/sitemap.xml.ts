import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { BRAND } from '../data/site';
import { SERVICES } from '../data/services';
import { CITIES, TOWN_PAGES, hubPath } from '../data/cities';

/* Every indexable page, by its production address. Built from the same data
   that builds the pages, so it cannot list a page that does not exist. */
const STATIC = ['/', '/services/', '/service-areas/', '/gallery/', '/reviews/', '/about-us/', '/contact-us/', '/get-an-estimate/', '/journal/', '/privacy-policy/'];

export const GET: APIRoute = async () => {
  const [services, towns, cities, posts] = await Promise.all([getCollection('services'), getCollection('towns'), getCollection('cities'), getCollection('blog')]);
  const paths = [
    ...STATIC,
    ...services.map((e) => SERVICES.find((s) => s.id === e.data.service)?.path).filter(Boolean),
    ...cities.flatMap((e) => { const c = CITIES.find((x) => x.id === e.data.city); return c ? [hubPath(c)] : []; }),
    ...towns.flatMap((e) => {
      const page = TOWN_PAGES.find((p) => p.service.id === e.data.service && p.city.id === e.data.city);
      return page ? [`/${page.slug}/`] : [];
    }),
    ...posts.map((p) => `/journal/${p.id}/`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${BRAND.origin}${p}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
