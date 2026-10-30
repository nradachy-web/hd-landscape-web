/* JSON-LD builders. This is how an answer engine reads the business, so it is
   thorough: who, where, what, and how each page relates to the others. Facts come
   from data/site.ts. There is deliberately no aggregateRating: Google does not
   accept a business marking up its own reviews on its own site.

   schema.org has no landscaper type. HomeAndConstructionBusiness is the nearest
   real one, and the product ontology link says the rest. */

import { BRAND, FLORIDA, LINKS } from '../data/site';
import { CITIES, cityLabel } from '../data/cities';
import { MI_SERVICES } from '../data/services';
import { plain } from './rich';

const ORIGIN = BRAND.origin;
export const BUSINESS_ID = `${ORIGIN}/#business`;
const WEBSITE_ID = `${ORIGIN}/#website`;

export function business() {
  return {
    '@type': ['HomeAndConstructionBusiness', 'LocalBusiness'],
    '@id': BUSINESS_ID,
    name: BRAND.name,
    legalName: BRAND.legalName,
    additionalType: 'https://www.productontology.org/id/Landscaping',
    description: `${BRAND.name} is a landscape company based in ${BRAND.city}, Michigan, owned by ${BRAND.owner}. It designs, builds and maintains landscapes for homes and businesses across Metro Detroit, including sod installation, hedge trimming, landscape design, retaining walls and monthly maintenance${FLORIDA ? ', with winter work around Fort Lauderdale, Florida' : ''}.`,
    url: `${ORIGIN}/`,
    telephone: BRAND.phoneE164,
    email: BRAND.email,
    image: `${ORIGIN}/og-image.jpg`,
    logo: `${ORIGIN}/icon-512.png`,
    address: { '@type': 'PostalAddress', addressLocality: BRAND.city, addressRegion: BRAND.state, addressCountry: 'US' },
    areaServed: CITIES.map((c) => ({ '@type': 'City', name: cityLabel(c) })),
    knowsAbout: MI_SERVICES.map((s) => s.name),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Landscape services',
      itemListElement: MI_SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: `${ORIGIN}${s.path}` } })),
    },
    sameAs: [LINKS.google, LINKS.facebook, LINKS.tiktok],
    founder: { '@type': 'Person', name: BRAND.owner },
  };
}

/** The short form every page but home carries: enough to say who, and points at the full node. */
export function businessRef() {
  return {
    '@type': ['HomeAndConstructionBusiness', 'LocalBusiness'],
    '@id': BUSINESS_ID,
    name: BRAND.name,
    url: `${ORIGIN}/`,
    telephone: BRAND.phoneE164,
    image: `${ORIGIN}/og-image.jpg`,
    address: { '@type': 'PostalAddress', addressLocality: BRAND.city, addressRegion: BRAND.state, addressCountry: 'US' },
  };
}

export function website() {
  return { '@type': 'WebSite', '@id': WEBSITE_ID, url: `${ORIGIN}/`, name: BRAND.name, publisher: { '@id': BUSINESS_ID } };
}

export function serviceSchema(opts: { name: string; type: string; description: string; url: string; area?: string }) {
  return {
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.type,
    description: plain(opts.description),
    url: opts.url,
    provider: { '@id': BUSINESS_ID },
    areaServed: opts.area ? { '@type': 'City', name: opts.area } : CITIES.filter((c) => c.state === 'MI').map((c) => ({ '@type': 'City', name: cityLabel(c) })),
  };
}

export function serviceListSchema() {
  return {
    '@type': 'ItemList',
    itemListElement: MI_SERVICES.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: `${ORIGIN}${s.path}` })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: plain(i.a) } })),
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: `${ORIGIN}${t.path}` })),
  };
}

export function article(opts: { headline: string; description: string; path: string; image: string; published: string; updated?: string; about: string }) {
  return {
    '@type': 'Article',
    headline: plain(opts.headline),
    description: opts.description,
    url: `${ORIGIN}${opts.path}`,
    mainEntityOfPage: `${ORIGIN}${opts.path}`,
    image: `${ORIGIN}${opts.image}`,
    datePublished: opts.published,
    dateModified: opts.updated ?? opts.published,
    author: { '@type': 'Person', name: BRAND.owner, worksFor: { '@id': BUSINESS_ID } },
    publisher: { '@id': BUSINESS_ID },
    about: { '@type': 'Thing', name: opts.about },
  };
}

export function graph(nodes: object[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
