/* The Yard Studio: what can be swapped, and what is worth knowing about each pick.
   Sizes are typical for Southeast Michigan. Clipped plants are given at the height
   they are kept. This is general guidance for an illustration, and the page says so:
   what suits a real yard depends on its light and soil, and Jake says that on the walk.

   Each option with a layer has an image in src/assets/studio, cut by scripts/studio.py.
   `stack` is the order the layers sit in, back to front. */

export interface StudioOption {
  id: string;
  name: string;
  /** No layer means the bare scene already shows this. */
  layer?: string;
  /** Picker thumbnail. Falls back to the layer. */
  thumb?: string;
  meta?: string;
  note: string;
}

export interface StudioSlot {
  id: string;
  name: string;
  /** How far back it sits. Lower is further from the camera. */
  stack: number;
  first: string;
  /** Lies flat on the ground, so it fades in instead of growing. */
  flat?: boolean;
  options: StudioOption[];
}

export const SLOTS: StudioSlot[] = [
  {
    id: 'tree',
    name: 'Accent tree',
    stack: 5,
    first: 'maple',
    options: [
      { id: 'none', name: 'No tree', note: 'Leaves the corner of the house open.' },
      { id: 'maple', name: 'Japanese maple', layer: 'tree-maple', meta: 'Part sun. 15 to 20 ft.', note: 'Deep red leaves and a layered shape that stays in scale with a house.' },
      { id: 'dogwood', name: 'Flowering dogwood', layer: 'tree-dogwood', meta: 'Part shade. 15 to 25 ft.', note: 'White spring blooms, with a shape that still looks good in winter.' },
      { id: 'cherry', name: 'Weeping cherry', layer: 'tree-cherry', meta: 'Full sun. 15 to 25 ft.', note: 'Pink spring blooms on branches that hang almost to the ground.' },
      { id: 'birch', name: 'River birch', layer: 'tree-birch', meta: 'Sun or part shade. 40 ft and up.', note: 'Peeling bark all year. It gets big, so it wants real room off the house.' },
    ],
  },
  {
    id: 'found',
    name: 'Along the house',
    stack: 2,
    first: 'box',
    options: [
      { id: 'none', name: 'Bare bed', note: 'Just the bed, ready for planting.' },
      { id: 'box', name: 'Boxwood globes', layer: 'found-box', meta: 'Sun or part shade. Kept 3 to 4 ft.', note: 'Evergreen and tidy, and they hold their shape through winter.' },
      { id: 'hydrangea', name: 'Annabelle hydrangea', layer: 'found-hydrangea', meta: 'Part sun. 3 to 5 ft.', note: 'Big white blooms in summer. Cut back each spring.' },
      { id: 'yew', name: 'Clipped yew hedge', layer: 'found-yew', meta: 'Sun or shade. Kept 2 to 3 ft.', note: 'A formal evergreen line that handles shade better than most.' },
      { id: 'mixed', name: 'Mixed planting', layer: 'found-mixed', meta: 'Sun or part sun. 2 to 4 ft.', note: 'Boxwood for structure, with hydrangea, catmint and grasses for movement and color.' },
    ],
  },
  {
    id: 'entry',
    name: 'By the front door',
    stack: 3,
    first: 'topiary',
    options: [
      { id: 'none', name: 'Keep it clear', note: 'Lets the door and columns stand on their own.' },
      { id: 'topiary', name: 'Spiral topiaries', layer: 'entry-topiary', meta: 'Sun or part shade. In urns.', note: 'A formal welcome. Evergreens in pots need steady water and a sheltered winter.' },
      { id: 'urns', name: 'Seasonal urns', layer: 'entry-urns', meta: 'Full sun. Replanted each season.', note: 'Geraniums and ivy for summer, then something new for fall.' },
      { id: 'arbor', name: 'Emerald arborvitae', layer: 'entry-arbor', meta: 'Sun or part shade. 12 to 15 ft.', note: 'Tall and narrow, and it frames the door without taking up the bed.' },
    ],
  },
  {
    id: 'walk',
    name: 'Along the walk',
    stack: 4,
    first: 'none',
    options: [
      { id: 'none', name: 'Lawn to the walk', note: 'Simple and open.' },
      { id: 'hedge', name: 'Low boxwood hedge', layer: 'walk-hedge', meta: 'Sun or part shade. Kept 12 to 18 in.', note: 'Turns the walk into a clear, formal way in.' },
      { id: 'rock', name: 'River rock and boulders', layer: 'walk-rock', meta: 'No watering, no trimming.', note: 'Stays put and does not need topping up.' },
      { id: 'color', name: 'Perennial border', layer: 'walk-color', meta: 'Full sun. 18 to 30 in.', note: 'Catmint, lavender and black eyed Susans, back every year.' },
    ],
  },
  {
    id: 'ground',
    name: 'Bed finish',
    stack: 0,
    first: 'black',
    flat: true,
    options: [
      { id: 'black', name: 'Black mulch', thumb: 'ground-black', note: 'Sharp against brick and green.' },
      { id: 'brown', name: 'Brown mulch', layer: 'ground-brown', note: 'Warm and natural. Blends into older homes.' },
      { id: 'river', name: 'River rock', layer: 'ground-river', note: 'Stays put and does not need topping up.' },
      { id: 'stone', name: 'Black stone', layer: 'ground-stone', note: 'Clean and modern, and a favorite of ours.' },
    ],
  },
  {
    id: 'border',
    name: 'Bed edge',
    stack: 1,
    first: 'steel',
    flat: true,
    options: [
      { id: 'none', name: 'Clean cut edge', note: 'The simplest line there is, recut as it softens.' },
      { id: 'steel', name: 'Steel edging', layer: 'border-steel', note: 'A clean, modern line that keeps grass out of the bed.' },
      { id: 'block', name: 'Block border', layer: 'border-block', note: 'A low border that finishes the bed.' },
    ],
  },
];
