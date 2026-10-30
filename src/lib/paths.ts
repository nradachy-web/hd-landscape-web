/* Internal links go through href() so the same source builds for the bare
   domain and for the /hd-landscape-web/ preview. Content files always write
   site-relative paths ("/ceramic-coating/"). */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function href(path: string): string {
  if (/^(https?:|tel:|sms:|mailto:|#)/.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean}`;
}

/** Absolute production URL for canonicals, the sitemap and schema. */
export function absolute(path: string, site: URL | undefined): string {
  const origin = (site?.toString() ?? 'https://hdlandscapellc.com/').replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${BASE}${clean}`;
}

export const isExternal = (path: string) => /^https?:/.test(path);
