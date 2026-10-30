/* The hero photo is the largest thing on the first screen, so a page builds it
   once here and hands the result to both the layout (for the preload hint) and
   the Hero component (for the picture itself). */

import { getImage } from 'astro:assets';
import { photo, type PhotoId } from '../data/photos';

export interface HeroImage {
  alt: string;
  width: number;
  height: number;
  sizes: string;
  avif: string;
  webp: string;
  fallback: string;
  preload: { srcset: string; sizes: string; type: string; media?: string };
  note?: string;
}

const WIDTHS = [420, 640, 828, 1080, 1320, 1680, 1916];

export async function heroImage(id: PhotoId, opts: { ratio?: number; focus?: string; sizes?: string; widths?: number[]; media?: string } = {}): Promise<HeroImage> {
  const p = photo(id);
  const ratio = opts.ratio ?? p.src.width / p.src.height;
  // height driven crops: a wide photo in a tall box needs more pixels than its width suggests
  const sizes = opts.sizes ?? '(min-width: 56rem) 78vw, 150vw';
  const widths = (opts.widths ?? WIDTHS.slice(0, 6)).filter((w) => w <= p.src.width);

  const build = async (format: 'avif' | 'webp' | 'jpeg', quality: number) => {
    const out = await Promise.all(
      widths.map(async (w) => {
        const img = await getImage({ src: p.src, width: w, height: Math.round(w / ratio), format, quality, fit: 'cover', position: opts.focus ?? p.focus ?? 'center' });
        return `${img.src} ${w}w`;
      }),
    );
    return out.join(', ');
  };

  const [avif, webp] = await Promise.all([build('avif', 46), build('webp', 60)]);
  const last = widths[widths.length - 1];
  const mid = widths[Math.min(2, widths.length - 1)];
  const fb = await getImage({ src: p.src, width: mid, height: Math.round(mid / ratio), format: 'jpeg', quality: 70, fit: 'cover', position: opts.focus ?? p.focus ?? 'center' });

  return {
    alt: p.alt,
    width: last,
    height: Math.round(last / ratio),
    sizes,
    avif,
    webp,
    fallback: fb.src,
    preload: { srcset: avif, sizes, type: 'image/avif', media: opts.media },
    note: p.kind === 'ai' ? 'Illustration' : p.kind === 'relit' ? p.caption : undefined,
  };
}
