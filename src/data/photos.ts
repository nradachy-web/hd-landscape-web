/* The photo library. Three kinds, and the page always tells the truth about which:
     real    Jake's own job photos and stills from his own reels.
     relit   a real finished job, relit for evening. The caption says so.
     ai      made from a prompt for a service with no job photo yet. The caption
             says "Illustration". Never used as proof of a job.
   `alt` says what is in the frame; `caption` is what may be printed under it.
   Never caption a photo with a town: the jobs are not labeled by location.

   Add a photo: put the original in _source, add it to scripts/photos.py, run
   `npm run photos`, then describe it here. */

import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });
const byId: Record<string, ImageMetadata> = {};
for (const [path, mod] of Object.entries(files)) byId[path.split('/').pop()!.replace(/\.jpg$/, '')] = mod.default;

type Kind = 'real' | 'relit' | 'ai';
/** `focus` says where a fixed crop should anchor when the subject is not in the middle. */
interface Entry { alt: string; caption: string; kind?: Kind; focus?: 'top' | 'bottom' | 'left' | 'right' }

export const PHOTOS = {
  // design and renovation
  'maple-modern': { alt: 'A red Japanese maple and clipped hedges in front of a modern brick home under a blue sky', caption: 'Red maple, clipped hedges and a fresh bed line' },
  'maple-rock-bed': { alt: 'A red Japanese maple rising from a bed of boulders and grasses beside a horizontal fence', caption: 'Japanese maple over boulders and grasses' },
  'maple-court': { alt: 'A stone courtyard edged with a low stone border, bronze spheres and a brick screen wall', caption: 'Courtyard planting with a low stone border' },
  'curve-brick-bed': { alt: 'A curved raised bed with a block border, black mulch, alliums and a young tree in front of a brick ranch', caption: 'Curved raised bed with a block border' },
  'curve-fall': { alt: 'A clipped hedge following a curved stone bed in front of a brick home, with red fall color', caption: 'A clipped hedge on a curved stone bed, in fall' },
  'colonial-fall': { alt: 'A brick colonial with a curving ground cover bed and an orange tree in fall', caption: 'Curving bed on a brick colonial, in fall' },
  'urn-bed': { alt: 'A brick patio with a black urn of red flowers, clipped shrubs and a sweeping bed in front of a sage sided home', caption: 'Sweeping beds around a brick patio' },
  'patio-bed': { alt: 'A mulched island bed with boulders and shrubs beside a paver patio and dining set', caption: 'Island bed with boulders beside the patio' },
  'tudor-planting': { alt: 'Fresh planting along the front of a stone and brick tudor', caption: 'New planting along a tudor front' },
  'grand-brick': { alt: 'A large brick home with arched windows, a Japanese maple and curved clipped beds', caption: 'Curved beds on a large brick home' },
  'stone-manor': { alt: 'Clipped boxwood hedges and spiral topiaries on a stone edged bed in front of a stone and brick home', caption: 'Boxwood, topiary and a stone edge' },
  'island-bed': { alt: 'A mulched island bed with shaped trees and shrubs in a wide green lawn', caption: 'An island bed in a wide lawn' },
  'pergola-deck': { alt: 'A brick home with a white pergola and deck above a clean bed line and green lawn', caption: 'Clean bed lines below a deck and pergola' },
  'shade-lawn': { alt: 'A brick colonial with a red door behind a big shade tree and a thick green lawn', caption: 'Lawn and beds under a big shade tree' },
  'fall-colonial': { alt: 'A two story home with a low clipped hedge and a rounded tree in the front yard', caption: 'Low clipped hedge and a rounded tree' },
  // stone, edging, walls
  'weeping-border': { alt: 'A low block border holding black mulch, small shrubs and a weeping tree along a brick ranch', caption: 'Low block border along a ranch' },
  'ranch-stone-bed': { alt: 'A new raised bed with a stacked block border, a young tree and small shrubs at a brick ranch', caption: 'New raised bed with a stacked block border' },
  'rock-bed-hydrangea': { alt: 'A raised block planter of gray river rock and pink hydrangeas beside a driveway', caption: 'River rock and hydrangeas in a block planter' },
  'hosta-bed': { alt: 'Hostas and a small Japanese maple in a mulched bed with a curved paver border', caption: 'Hostas in a curved paver border' },
  'limestone-bed': { alt: 'A mulched bed edged in limestone blocks beside a brick paver walk, with a bench and a small tree', caption: 'Limestone edge beside a paver walk' },
  'black-stone-kidney': { alt: 'A kidney shaped bed of black stone with small plants and a young tree in a green lawn', caption: 'Black stone bed set into the lawn' },
  'slate-sidewalk': { alt: 'A gray stone walk through river rock along the side of a brick home', caption: 'Stone walk and river rock on a side yard' },
  'thrift-boulder': { alt: 'Pink and white flowering ground cover around a large boulder in a corner bed against brick', caption: 'Boulder and spring color in a corner bed' },
  'paver-walk': { alt: 'A curving brick paver walk through dark mulch beds and small shrubs', caption: 'Curving paver walk through dark beds' },
  'flagstone-side': { alt: 'Flagstone stepping stones and river rock running down a narrow side yard to a gate', caption: 'Flagstone path down a side yard' },
  'flagstone-hydrangea': { alt: 'Clipped boxwood balls and white hydrangeas beside a flagstone walk', caption: 'Boxwood and hydrangeas beside a flagstone walk' },
  'steppers-lawn': { alt: 'Concrete steppers set into a fresh lawn along a side yard', caption: 'Steppers set into fresh lawn' },
  'river-rock-beds': { alt: 'A front walk lined with river rock borders, mulched beds and clipped shrubs', caption: 'River rock lining a front walk' },
  // hedges
  'hedge-walk': { alt: 'A low clipped hedge curving beside a front walk at a brick home with white columns', caption: 'Clipped hedge along a front walk' },
  'tall-hedge': { alt: 'A tall arborvitae hedge cut flat and square along a concrete drive', caption: 'A tall hedge cut flat and square' },
  'pool-hedge': { alt: 'A tall rounded hedge behind a backyard pool', caption: 'A tall hedge behind the pool' },
  'hedge-long': { alt: 'A long tall hedge cut in one clean curve beside a green lawn', caption: 'One long, clean hedge line' },
  'hedge-curve': { alt: 'A freshly trimmed low hedge curving along a sidewalk beside white hydrangeas', caption: 'Fresh trim along a walk' },
  'topiary-spiral': { alt: 'A shrub clipped into a stacked topiary in a black stone bed beside hydrangeas', caption: 'Hand clipped topiary' },
  'boxwood-front': { alt: 'Clipped boxwood rows, ground cover and a crisp lawn edge along a brick home in morning sun', caption: 'Clipped rows and a crisp lawn edge' },
  // lawns and sod
  'sod-backyard': { alt: 'A fresh sod lawn with visible seams beside a rock edged bed under a large tree', caption: 'Fresh sod the day it went down' },
  'sod-colonial': { alt: 'A fresh green sod front lawn at a brick and sided colonial with an HD Landscape yard sign', caption: 'New sod on a front lawn' },
  'sod-circle': { alt: 'A crew member shaping a circular bed in a lawn with a stone edge', caption: 'Shaping a new circular bed' },
  'grade-rake': { alt: 'A crew member raking and leveling bare soil across a yard before sod', caption: 'Raking the grade before sod', focus: 'top' },
  'grade-jake': { alt: 'Bare graded soil next to an existing lawn and a driveway', caption: 'Graded and ready for sod' },
  // planting and containers
  'entry-planter': { alt: 'A front door planter with a large canna, pink flowers and trailing vines', caption: 'Entry planter' },
  'window-planter': { alt: 'Red begonias and trailing greens in a planter under a window', caption: 'Seasonal color under a window' },
  'evergreen-island': { alt: 'Upright evergreens and white hydrangeas in a round mulched bed in a lawn', caption: 'Evergreens and hydrangeas in a round bed' },
  'lakeside-bed': { alt: 'A long mulched bed with boulders and small plants along a drive with the lake behind it', caption: 'Boulders and low planting near the lake' },
  // commercial
  'commercial-palms': { alt: 'Planters of palms and flowers along a black stone bed at a dark blue commercial building', caption: 'Commercial entry planting' },
  'commercial-entry': { alt: 'Concrete pavers set in turf strips leading to the entry of a dark blue commercial building', caption: 'Commercial entry walk and clipped hedges' },
  'condo-evergreens': { alt: 'Upright evergreens and black stone planted along a brick commercial building', caption: 'Evergreens and stone along a building' },
  // Florida
  'florida-agave': { alt: 'Agave and black stone in a raised bed along a stucco home', caption: 'Agave and black stone, South Florida' },
  'florida-hedge': { alt: 'A clipped hedge, grasses and black stone along a stucco home with a metal roof at sunset', caption: 'Clipped hedge and black stone, South Florida' },
  // people
  'jake-polo': { alt: 'Jake Hendricks, owner of HD Landscape, in a company polo and sunglasses in front of a brick home', caption: 'Jake Hendricks, owner', focus: 'top' },
  'yard-sign': { alt: 'An HD Landscape yard sign on a fresh green lawn with a sports car in the drive behind it', caption: 'Our sign on a finished lawn' },
  // relit real jobs
  'hero-wide': { alt: 'A red Japanese maple lit from below at dusk in front of a modern home, with a long dark lawn', caption: 'A finished HD Landscape job, relit for evening', kind: 'relit' },
  'hero-tall': { alt: 'A red Japanese maple lit from below at dusk in front of a modern home', caption: 'A finished HD Landscape job, relit for evening', kind: 'relit' },
  'dusk-maple': { alt: 'A red Japanese maple glowing at blue hour against a modern brick home', caption: 'A finished job, relit for evening', kind: 'relit' },
  'dusk-curve': { alt: 'A curved stone bed and clipped hedge at dusk in front of a brick ranch with lit windows', caption: 'A finished job, relit for evening', kind: 'relit' },
  'dusk-urn': { alt: 'A paver patio, urn of red flowers and sweeping beds at dusk beside a sage home with glowing windows', caption: 'A finished job, relit for evening', kind: 'relit' },
  'dusk-patio': { alt: 'An island bed with boulders at dusk beside a lit patio and low brick home', caption: 'A finished job, relit for evening', kind: 'relit' },
  'dusk-sidewalk': { alt: 'A curving paver walk through dark beds at dusk beside lit windows', caption: 'A finished job, relit for evening', kind: 'relit' },
  'dusk-stone': { alt: 'Boxwood hedges and topiary at dusk in front of a lit stone and brick home', caption: 'A finished job, relit for evening', kind: 'relit' },
  'dusk-grand': { alt: 'Curved beds and a Japanese maple at dusk in front of a large brick home with arched windows', caption: 'A finished job, relit for evening', kind: 'relit' },
  'dusk-lake': { alt: 'A long bed of boulders and low plants at dusk with a colored sky over the lake', caption: 'A finished job, relit for evening', kind: 'relit' },
  'dusk-column': { alt: 'A clipped hedge and front walk at dusk at a brick home with white columns', caption: 'A finished job, relit for evening', kind: 'relit' },
  // illustrations
  'ai-design': { alt: 'A hand sketching a curved planting plan on a truck tailgate', caption: 'Illustration', kind: 'ai' },
  'ai-grading': { alt: 'A compact track loader smoothing dark topsoil in a backyard', caption: 'Illustration', kind: 'ai' },
  'ai-mulch': { alt: 'Fresh dark mulch being raked around a boxwood', caption: 'Illustration', kind: 'ai' },
  'ai-plant-removal': { alt: 'An overgrown shrub lifted out of a bed with its root ball', caption: 'Illustration', kind: 'ai' },
  'ai-polymeric': { alt: 'A push broom sweeping polymeric sand into paver joints', caption: 'Illustration', kind: 'ai' },
  'ai-pressure': { alt: 'A pressure washer wand cleaning a brick paver walk, half dark and half bright', caption: 'Illustration', kind: 'ai' },
  'ai-sod': { alt: 'A roll of green sod being unrolled onto prepared soil', caption: 'Illustration', kind: 'ai' },
  'ai-steel': { alt: 'A black steel edge curving between bright grass and dark mulch', caption: 'Illustration', kind: 'ai' },
  'ai-stump': { alt: 'Fresh wood chips where a stump was ground out of a lawn', caption: 'Illustration', kind: 'ai' },
  'ai-tree': { alt: 'A pole saw pruning a low limb of a small tree', caption: 'Illustration', kind: 'ai' },
  'ai-weeding': { alt: 'Gloved hands lifting a weed with its root out of a mulched bed', caption: 'Illustration', kind: 'ai' },
  'ai-watering': { alt: 'A gloved hand watering a new bed with a hose', caption: 'Illustration', kind: 'ai' },
  // before and after frames
  'ba-side-before': { alt: 'Before: a weedy corner of lawn and old plants beside a brick wall', caption: 'Before' },
  'ba-side-after': { alt: 'After: a black stone bed with a curved steel edge, boulders and a weeping tree', caption: 'After' },
  'ba-corner-before': { alt: 'Before: a bare corner of gravel and dead grass against a brick wall', caption: 'Before' },
  'ba-corner-after': { alt: 'After: a clean black stone bed with a low hedge against the wall', caption: 'After' },
  'ba-foundation-before': { alt: 'Before: weeds along a brick foundation and a sidewalk', caption: 'Before' },
  'ba-foundation-after': { alt: 'After: a fresh black mulch bed along the same foundation', caption: 'After' },
  'ba-hedge-before': { alt: 'Before: an overgrown shaggy hedge along a sidewalk', caption: 'Before' },
  'ba-hedge-after': { alt: 'After: the same hedge clipped into a clean curve', caption: 'After' },
  'ba-sod-before': { alt: 'Before: a rough sloped yard with overgrown plants', caption: 'Before' },
  'ba-sod-after': { alt: 'After: the same yard with smooth new sod, a clean hedge line and steppers', caption: 'After' },
} satisfies Record<string, Entry>;

export type PhotoId = keyof typeof PHOTOS;
export const PHOTO_IDS = Object.keys(PHOTOS) as [PhotoId, ...PhotoId[]];

export const photo = (id: PhotoId) => {
  const e = PHOTOS[id] as Entry;
  const src = byId[id];
  if (!src) throw new Error(`No file for photo ${id}: run npm run photos`);
  return { ...e, kind: e.kind ?? 'real', src };
};

export const PAIRS = {
  'ba-side': { before: 'ba-side-before', after: 'ba-side-after', title: 'Weedy corner to black stone bed', note: 'Block border and weeds out, a steel edge curved in, then black stone, boulders and a weeping tree.' },
  'ba-corner': { before: 'ba-corner-before', after: 'ba-corner-after', title: 'Bare corner to finished bed', note: 'Gravel and dead grass cleared, then black stone and a low hedge.' },
  'ba-foundation': { before: 'ba-foundation-before', after: 'ba-foundation-after', title: 'Weeds to a clean foundation bed', note: 'Beds pulled, the line cut and fresh black mulch down.' },
  'ba-hedge': { before: 'ba-hedge-before', after: 'ba-hedge-after', title: 'Shaggy to shaped', note: 'The same hedge, the same sidewalk, one visit apart.' },
  'ba-sod': { before: 'ba-sod-before', after: 'ba-sod-after', title: 'Rough slope to new lawn', note: 'Regraded, new sod laid, and steppers set into the lawn.' },
} satisfies Record<string, { before: PhotoId; after: PhotoId; title: string; note: string }>;
export type PairId = keyof typeof PAIRS;
