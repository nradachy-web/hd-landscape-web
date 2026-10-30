# Design: After dark

## The idea
The site should feel like the yard at dusk with the lights on: calm, expensive, looked after. It opens on one of his real jobs relit for evening, and the headline is how his business really grows: "The yard your neighbors ask about."

## Two planes and a cut line
| Plane | Token | Use |
|---|---|---|
| Ink | `--ink` #0a0f0b | Heroes, proof, the estimate band, the footer |
| Paper | `--paper` #f4f1e9 limestone | Reading bands |
| White | `--white` #fdfcf8 | A second light plane |

Where ink meets a light band they meet on a cut bed line (`Edge.astro`), the curve that runs through Jake's real work, with a thin green line riding it like steel edging. Use `has-edge` on the band above so the curve has room.

## One accent
New growth green. `--leaf` #bcdc6c on ink, with ink text on it. `--forest` #2c5a1f for buttons on paper. `--leaf-ink` for green text on paper. Lamp amber `--lamp` is for stars only. Nothing else has color.

## Type
Newsreader at its display cut (500) for headlines, set tight, with one phrase in italic green: `**like this**` in any heading. Inter Tight for reading. Sentence case. Three subset fonts, about 60 KB total, in `src/assets/fonts`.

## Motion
One page-load moment on the home page: the lights come on (a dark veil lifts off the photo, opacity only), the words rise, and a slow drift starts. Then fireflies wake up over the dusk photos, 2.6 seconds after load, and lean toward the pointer (`Fireflies.astro`). Below that, motion answers the visitor. Nothing slides in on scroll. Reduced motion gets a still page.

## Signature panels
- **Try the bed** (`BedPicker.astro`, `scripts/bed.py`): his real bed, six ground covers, pixel aligned because only the mulch pixels change. Radio buttons, no script. On home, design, rock and stone, mulching.
- **Grade** (`GradePanel.astro`): drag the slope of a yard and watch where rain goes. On yard grading.
- **Before and after** (`BeforeAfter.astro`): real pairs pulled from Jake's own 4K reels.

## Photos: tell the truth about which is which
`src/data/photos.ts` has three kinds. `real`: his jobs and his reels. `relit`: a real job relit for evening with an image model, captioned as such, because the lighting in those frames is not proof of a lighting install. `ai`: an illustration for a service with no job photo, always captioned "Illustration", never in the gallery. Never caption a photo with a town. Nick does not want a filterable gallery, expand icons or a modal viewer.

## Performance rules. These are why it scores.
- No client framework, no external stylesheet. CSS is inlined.
- The hero is art directed, preloaded by media query, `fetchpriority="high"`, never lazy.
- The logo is an SVG file so it caches across pages.
- Every image has width and height. Everything below the hero is lazy.
- Google Analytics waits for the first touch, scroll or key press, except ad visits and the thank-you page.
- No scroll-linked animation and no video on load.
- `content-visibility` was not used: it broke in-page jumps on the last build.

## Answer engines
Jake's first ask was to show up in ChatGPT. `robots.txt` welcomes the AI crawlers, `/llms.txt` is built from the same data as the pages, JSON-LD names the business, services, area and FAQ on every page, and pages open with the direct answer.
