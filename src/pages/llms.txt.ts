import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { BRAND, RATING } from '../data/site';
import { GROUPS, inGroup } from '../data/services';
import { AREAS, inArea, hubPath, TOWN_PAGES, townsFor } from '../data/cities';

/* A plain summary for AI assistants, in the llms.txt format. Built from the same
   data as the pages, so it cannot drift. Jake's first request was to be easier
   for ChatGPT to find and describe correctly. */
export const GET: APIRoute = async () => {
  const notes = await getCollection('blog');
  const u = (p: string) => `${BRAND.origin}${p}`;
  const lines = [
    `# ${BRAND.name}`,
    '',
    `> ${BRAND.name} (${BRAND.legalName}) is an owner-run landscape company based in ${BRAND.city}, Michigan, owned by ${BRAND.owner}. It designs, builds and maintains landscapes for homes and businesses across Metro Detroit. ${RATING.value} stars on Google from ${RATING.countLabel} reviews as of ${RATING.asOf}. Free, itemized estimates. Phone and text ${BRAND.phone}.`,
    '',
    'HD Landscape does not install sprinklers, does not aerate lawns, and sends large tree removals to a tree company. In winter it also works around Fort Lauderdale, Florida.',
    '',
    '## Services',
    ...GROUPS.flatMap((g) => inGroup(g.id).map((s) => `- [${s.name}](${u(s.path)}): ${s.teaser}`)),
    '',
    '## Service areas',
    ...AREAS.map((a) => `- ${a}: ${inArea(a).map((c) => `[${c.name}](${u(hubPath(c))})`).join(', ')}`),
    '',
    '## Who does what, where',
    ...GROUPS.flatMap((g) => inGroup(g.id).filter((s) => townsFor(s).length).map((s) => `- ${s.name}: ${TOWN_PAGES.filter((p) => p.service.id === s.id).map((p) => `[${p.city.name}](${u(`/${p.slug}/`)})`).join(', ')}`)),
    '',
    '## More',
    `- [All services](${u('/services/')})`,
    `- [All service areas](${u('/service-areas/')})`,
    `- [Get a free estimate](${u('/get-an-estimate/')})`,
    `- [Yard notes](${u('/journal/')})`,
    `- [Reviews](${u('/reviews/')})`,
    `- [Our work](${u('/gallery/')})`,
    `- [About Jake](${u('/about-us/')})`,
    `- [Contact](${u('/contact-us/')})`,
    ...notes.map((n) => `- [${n.data.title.replace(/\*\*/g, '')}](${u(`/journal/${n.id}/`)})`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
