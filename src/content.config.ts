/* Content collections. The shapes live in content.schema.mjs so the same rules
   run here at build time and in scripts/check-content.mjs on demand. */

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { makeSchemas } from './content.schema.mjs';
import { PHOTO_IDS, PAIRS } from './data/photos';
import { REVIEWS } from './data/reviews';
import { ALL_SERVICES } from './data/services';
import { ALL_CITIES } from './data/cities';

const schemas = makeSchemas(z, {
  photos: PHOTO_IDS,
  pairs: Object.keys(PAIRS),
  reviews: REVIEWS.map((r) => r.id),
  services: ALL_SERVICES.map((s) => s.id),
  cities: ALL_CITIES.map((c) => c.id),
});

export type Block = z.infer<typeof schemas.block>;

export const collections = {
  services: defineCollection({ loader: glob({ pattern: '*.json', base: './src/content/services' }), schema: schemas.services }),
  towns: defineCollection({ loader: glob({ pattern: '*.json', base: './src/content/towns' }), schema: schemas.towns }),
  cities: defineCollection({ loader: glob({ pattern: '*.json', base: './src/content/cities' }), schema: schemas.cities }),
  blog: defineCollection({ loader: glob({ pattern: '*.json', base: './src/content/blog' }), schema: schemas.blog }),
};
