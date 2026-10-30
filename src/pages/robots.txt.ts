import type { APIRoute } from 'astro';

/* A preview build tells every crawler to stay out. Production lets them in. */
export const GET: APIRoute = () => {
  const preview = import.meta.env.BASE_URL !== '/';
  const body = preview
    ? 'User-agent: *\nDisallow: /\n'
    : [
        '# Search engines and AI answer engines are welcome here.',
        ...['*', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'].flatMap((a) => [`User-agent: ${a}`, 'Allow: /', '']),
        'Sitemap: https://hdlandscapellc.com/sitemap.xml',
        '',
      ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
