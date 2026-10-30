/* Which word runs repeat across the site's pages. The sentence check only catches
   whole sentences, so this one finds the stock phrases that make pages read alike.
     node scripts/phrases.mjs [words=5] [minPages=12] */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = new URL('..', import.meta.url).pathname;
const [n = 5, min = 12] = process.argv.slice(2).map(Number);
const strings = (x, o = []) => (typeof x === 'string' ? o.push(x) : Array.isArray(x) ? x.forEach((y) => strings(y, o)) : x && typeof x === 'object' && Object.values(x).forEach((y) => strings(y, o)), o);
const seen = new Map();
for (const k of ['services', 'cities', 'towns', 'blog']) {
  const dir = join(ROOT, 'src/content', k);
  for (const f of readdirSync(dir)) {
    const text = strings(JSON.parse(readFileSync(join(dir, f), 'utf8'))).join(' . ').toLowerCase().replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[^a-z0-9' ]+/g, ' | ');
    const page = new Set();
    for (const part of text.split('|')) {
      const w = part.trim().split(/\s+/).filter(Boolean);
      for (let i = 0; i + n <= w.length; i++) page.add(w.slice(i, i + n).join(' '));
    }
    for (const g of page) seen.set(g, (seen.get(g) || 0) + 1);
  }
}
const top = [...seen].filter(([, c]) => c >= min).sort((a, b) => b[1] - a[1]);
console.log(top.length, `${n} word runs on ${min}+ pages`);
for (const [g, c] of top.slice(0, 60)) console.log(String(c).padStart(4), g);
