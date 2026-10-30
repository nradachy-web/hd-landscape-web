/* The service registry: names, URLs and the one-line facts that the menu, cards
   and town pages share. Page copy lives in src/content. Palm trimming is Fort
   Lauderdale only. HD Landscape does not do sprinklers, lawn aeration or large
   tree removal itself. */

import type { PhotoId } from './photos';
import { FLORIDA } from './site';

export type ServiceId =
  | 'landscape-design' | 'landscape-renovation' | 'retaining-walls' | 'yard-grading' | 'steel-edging' | 'rock-stone'
  | 'sod-installation' | 'plant-installation' | 'plant-removal' | 'plant-watering'
  | 'hedge-trimming' | 'tree-work' | 'stump-grinding' | 'palm-trimming'
  | 'landscape-maintenance' | 'cleanups' | 'mulching' | 'weeding' | 'pressure-washing' | 'polymeric-sand';

export type GroupId = 'build' | 'plant' | 'trees' | 'care';

export interface Service {
  id: ServiceId;
  name: string;
  /** Lower case, for use mid sentence. */
  noun: string;
  path: string;
  /** Slug used for the service-in-a-town pages: /{townSlug}-{city}-mi/. */
  townSlug: string;
  group: GroupId;
  photo: PhotoId;
  /** The full bleed photo band near the end of the page. */
  band: PhotoId;
  teaser: string;
  /** Only in Florida. */
  florida?: boolean;
}

export const GROUPS: { id: GroupId; name: string; blurb: string; photo: PhotoId }[] = [
  { id: 'build', name: 'Design and build', blurb: 'New beds, walls, stone and grades, drawn for the property and built by our crew.', photo: 'dusk-curve' },
  { id: 'plant', name: 'Lawns and planting', blurb: 'Sod, trees, shrubs and flowers put in right, and looked after until they take.', photo: 'tudor-planting' },
  { id: 'trees', name: 'Hedges and trees', blurb: 'Sharp hedge lines, small tree work and stumps gone for good.', photo: 'hedge-curve' },
  { id: 'care', name: 'Care and upkeep', blurb: 'Monthly maintenance, cleanups, mulch and the jobs that keep a yard looking new.', photo: 'boxwood-front' },
];

const ALL: Service[] = [
  { id: 'landscape-design', name: 'Landscape design', noun: 'landscape design', path: '/landscape-design/', townSlug: 'landscape-design', group: 'build', photo: 'dusk-urn', band: 'dusk-patio', teaser: 'A plan drawn for your property, your light and how you actually use the yard.' },
  { id: 'landscape-renovation', name: 'Landscape renovation', noun: 'landscape renovation', path: '/landscape-renovation/', townSlug: 'landscape-renovation', group: 'build', photo: 'dusk-maple', band: 'dusk-curve', teaser: 'Old beds out, new grade, plants, stone and sod in. Front yards and full backyards.' },
  { id: 'retaining-walls', name: 'Retaining walls', noun: 'retaining wall', path: '/retaining-walls/', townSlug: 'retaining-walls', group: 'build', photo: 'weeping-border', band: 'dusk-stone', teaser: 'Block walls and raised bed borders that hold a grade and finish a bed.' },
  { id: 'yard-grading', name: 'Yard grading', noun: 'yard grading', path: '/yard-grading/', townSlug: 'yard-grading', group: 'build', photo: 'grade-rake', band: 'pergola-deck', teaser: 'Low spots, slopes and rough ground reshaped so the yard drains and sod lies flat.' },
  { id: 'steel-edging', name: 'Steel edging', noun: 'steel edging', path: '/steel-edging/', townSlug: 'steel-edging', group: 'build', photo: 'ai-steel', band: 'curve-fall', teaser: 'A clean, modern line that keeps grass out of the beds and stone out of the lawn.' },
  { id: 'rock-stone', name: 'Rock and stone installation', noun: 'rock and stone installation', path: '/rock-and-stone-installation/', townSlug: 'rock-stone-installation', group: 'build', photo: 'black-stone-kidney', band: 'patio-bed', teaser: 'River rock, black stone and boulders laid over a proper base.' },
  { id: 'sod-installation', name: 'Sod installation', noun: 'sod installation', path: '/sod-installation/', townSlug: 'sod-installation', group: 'plant', photo: 'sod-backyard', band: 'fall-colonial', teaser: 'Old lawn out, ground graded, fresh sod down in tight seams. One of our most requested jobs.' },
  { id: 'plant-installation', name: 'Plant installation', noun: 'plant installation', path: '/plant-installation/', townSlug: 'plant-installation', group: 'plant', photo: 'tudor-planting', band: 'urn-bed', teaser: 'Trees, shrubs and perennials set at the right depth, in the right place.' },
  { id: 'plant-removal', name: 'Plant removal', noun: 'plant removal', path: '/plant-removal/', townSlug: 'plant-removal', group: 'plant', photo: 'ai-plant-removal', band: 'curve-fall', teaser: 'Overgrown shrubs and tired beds out, roots and all, ready for something new.' },
  { id: 'plant-watering', name: 'Plant watering', noun: 'plant watering', path: '/plant-watering/', townSlug: 'plant-watering', group: 'plant', photo: 'ai-watering', band: 'dusk-maple', teaser: 'Dependable watering for fresh installs, vacations and everyday life.' },
  { id: 'hedge-trimming', name: 'Hedge trimming', noun: 'hedge trimming', path: '/hedge-trimming/', townSlug: 'hedge-trimming', group: 'trees', photo: 'hedge-curve', band: 'dusk-curve', teaser: 'Shaped by hand and eye. Straight lines, clean curves and no bare patches.' },
  { id: 'tree-work', name: 'Tree trimming and removal', noun: 'tree trimming', path: '/tree-trimming-and-removal/', townSlug: 'tree-trimming', group: 'trees', photo: 'ai-tree', band: 'maple-modern', teaser: 'Pruning and smaller tree removal by our crew. Big removals go to a tree company we trust.' },
  { id: 'stump-grinding', name: 'Stump grinding', noun: 'stump grinding', path: '/stump-grinding/', townSlug: 'stump-grinding', group: 'trees', photo: 'ai-stump', band: 'shade-lawn', teaser: 'Stumps ground below grade so the spot can go back to lawn or a new bed.' },
  { id: 'palm-trimming', name: 'Palm trimming', noun: 'palm trimming', path: '/palm-trimming-fort-lauderdale-fl/', townSlug: 'palm-trimming', group: 'trees', photo: 'florida-hedge', band: 'florida-hedge', teaser: 'Dead fronds and seed pods cleaned out, without overcutting the crown.', florida: true },
  { id: 'landscape-maintenance', name: 'Monthly landscape maintenance', noun: 'monthly landscape maintenance', path: '/monthly-landscape-maintenance/', townSlug: 'landscape-maintenance', group: 'care', photo: 'boxwood-front', band: 'curve-fall', teaser: 'Consistent monthly care to keep your landscape clean, polished and professional.' },
  { id: 'cleanups', name: 'Spring and fall cleanups', noun: 'spring or fall cleanup', path: '/spring-and-fall-cleanups/', townSlug: 'yard-cleanup', group: 'care', photo: 'colonial-fall', band: 'fall-colonial', teaser: 'Beds cleared, leaves gone, shrubs tidied and the yard reset for the season.' },
  { id: 'mulching', name: 'Mulching', noun: 'mulching', path: '/mulching/', townSlug: 'mulching', group: 'care', photo: 'curve-brick-bed', band: 'dusk-sidewalk', teaser: 'Fresh mulch at the right depth, spread clean and kept off the trunks and stems.' },
  { id: 'weeding', name: 'Weeding', noun: 'weeding', path: '/weeding/', townSlug: 'weeding', group: 'care', photo: 'ai-weeding', band: 'tudor-planting', teaser: 'Beds pulled by hand, roots out, so the plants you paid for get the room.' },
  { id: 'pressure-washing', name: 'Pressure washing', noun: 'pressure washing', path: '/pressure-washing/', townSlug: 'pressure-washing', group: 'care', photo: 'ai-pressure', band: 'maple-court', teaser: 'Walks, patios and pavers brought back from grime and green.' },
  { id: 'polymeric-sand', name: 'Polymeric sand', noun: 'polymeric sand', path: '/polymeric-sand/', townSlug: 'polymeric-sand', group: 'care', photo: 'ai-polymeric', band: 'urn-bed', teaser: 'Paver joints cleaned out and refilled so the surface locks up and stays weed free.' },
];

/** Every service the content may name, on or off. Content validates against this list. */
export const ALL_SERVICES = ALL;
export const SERVICES = ALL.filter((s) => FLORIDA || !s.florida);
export const service = (id: string) => SERVICES.find((s) => s.id === id)!;
export const inGroup = (g: GroupId) => SERVICES.filter((s) => s.group === g);
/** The services every Michigan town can have. */
export const MI_SERVICES = SERVICES.filter((s) => !s.florida);
