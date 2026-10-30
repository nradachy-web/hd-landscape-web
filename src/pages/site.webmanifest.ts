import type { APIRoute } from 'astro';
import { BRAND } from '../data/site';
import { href } from '../lib/paths';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: BRAND.legalName,
      short_name: BRAND.name,
      start_url: href('/'),
      display: 'browser',
      background_color: '#0a0f0b',
      theme_color: '#0a0f0b',
      icons: [
        { src: href('/icon-192.png'), sizes: '192x192', type: 'image/png' },
        { src: href('/icon-512.png'), sizes: '512x512', type: 'image/png' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
