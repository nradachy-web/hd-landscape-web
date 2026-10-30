/* After `astro build`:
   1. drop the full-size originals Astro copies into dist (no page links to them);
   2. check every page against the house rules and fail the build on a miss.
   Run by `npm run build`. */
import { readdirSync, readFileSync, rmSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const BASE = (process.env.BASE_PATH || '/').replace(/\/$/, '');

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const html = Object.fromEntries(pages.map((f) => [f, readFileSync(f, 'utf8')]));
const allHtml = Object.values(html).join('\n');

// 1. originals
let dropped = 0;
let bytes = 0;
for (const f of files) {
  const name = f.split('/').pop();
  if (!f.includes('/_astro/') || !/\.(jpg|jpeg|png)$/.test(name)) continue;
  if (allHtml.includes(name)) continue;
  bytes += statSync(f).size;
  rmSync(f);
  dropped++;
}

// 2. rules
const problems = [];
const flag = (page, msg) => problems.push(`${relative(DIST, page)}: ${msg}`);

const FORBIDDEN = [
  [/[–—]/, 'en or em dash'],
  [/\b(100%|every single|all) (five|5)[- ]star/i, 'a claim that every review is five stars'],
  [/#1\b|number one\b|best in (michigan|macomb|oakland)/i, 'a ranking claim'],
  [/lorem ipsum|TODO|TBD\b/i, 'placeholder text'],
  [/refresh my ride|ceramic coating|window tint|auto detailing/i, 'copy left over from the template'],
];

for (const [page, src] of Object.entries(html)) {
  const body = src.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
  // a forwarding page (Forward.astro) has no content to judge, only a link that must resolve
  const forward = /http-equiv="refresh"/.test(src) && !/<h1[\s>]/.test(body);
  const text = body.replace(/<[^>]+>/g, ' ');
  for (const [re, what] of FORBIDDEN) {
    const m = text.match(re);
    if (m) flag(page, `${what}: "…${text.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' ')}…"`);
  }
  // the phone number is always something a thumb can tap
  const unlinked = body.replace(/<a\b[\s\S]*?<\/a>/g, ' ').replace(/<[^>]+>/g, ' ');
  if (/\(586\) 718-8762/.test(unlinked)) flag(page, `the phone number appears as plain text, not a link: "…${unlinked.slice(Math.max(0, unlinked.search(/\(586\) 718-8762/) - 50), unlinked.search(/\(586\) 718-8762/) + 20).replace(/\s+/g, ' ')}"`);
  const h1 = body.match(/<h1[\s>]/g) || [];
  if (!forward && h1.length !== 1) flag(page, `${h1.length} h1 elements`);
  if (forward && !/<meta name="robots" content="noindex"/.test(src)) flag(page, 'forwarding page without noindex');
  const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');
  const title = decode((src.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  if (!forward && (title.length < 25 || title.length > 68)) flag(page, `title is ${title.length} characters (want 25 to 68): ${title}`);
  const desc = decode((src.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  if (!forward && (desc.length < 70 || desc.length > 165)) flag(page, `description is ${desc.length} characters (want 70 to 165)`);
  for (const img of body.match(/<img\b[^>]*>/g) || []) {
    if (!/\salt[=\s>]/.test(img)) flag(page, `image without alt: ${img.slice(0, 80)}`);
    if (!/\bwidth=/.test(img) || !/\bheight=/.test(img)) flag(page, `image without width and height: ${img.slice(0, 80)}`);
  }
  // internal links resolve to a built page or file
  for (const m of body.matchAll(/\bhref="([^"#?]+)[^"]*"/g)) {
    const url = m[1];
    if (/^(https?:|tel:|sms:|mailto:|data:)/.test(url)) continue;
    if (BASE && !url.startsWith(BASE + '/')) {
      flag(page, `link escapes the base path: ${url}`);
      continue;
    }
    const path = url.slice(BASE.length);
    const target = join(DIST, path.endsWith('/') ? `${path}index.html` : path);
    if (!existsSync(target)) flag(page, `broken link: ${url}`);
  }
}

// the same photo twice on one page (warning only)
let repeats = 0;
for (const [page, src] of Object.entries(html)) {
  const names = [...src.matchAll(/<img\b[^>]*\bsrc="[^"]*\/([a-z0-9-]+)\.[A-Za-z0-9_-]+_[^"]*"/g)].map((m) => m[1]);
  const twice = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))].filter((n) => !n.startsWith('bed-'));
  if (twice.length) { repeats++; if (process.env.AUDIT_REPEATS) console.log(`repeat ${relative(DIST, page)}: ${twice.join(', ')}`); }
}
if (repeats) console.log(`postbuild: ${repeats} pages show a photo twice`);
console.log(`postbuild: ${pages.length} pages, removed ${dropped} unused originals (${(bytes / 1e6).toFixed(1)} MB)`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n` + problems.map((p) => '  ' + p).join('\n'));
  if (!process.env.AUDIT_SOFT) process.exit(1);
} else {
  console.log('postbuild: every page passes the house rules');
}
