# HD Landscape website

The website for HD Landscape LLC (Jake Hendricks, St. Clair Shores, MI). Built by Modern Apex Strategies, October 2026, to replace the WordPress site at hdlandscapellc.com.

Astro, static HTML, no client framework, hosted on GitHub Pages. Preview: https://nradachy-web.github.io/hd-landscape-web/ (noindex).

- `docs/DESIGN.md`: the design system and the performance rules.
- `docs/URLS.md`: how addresses work.
- Copy is JSON in `src/content`. Facts, launch notes and open questions are kept outside this public repo.

`npm run build` builds and checks the house rules. `node scripts/check-content.mjs <file>` checks one content file.
