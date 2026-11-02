/* The towns. St. Clair Shores is home, so its service pages ARE the main service
   pages. Every town gets a hub at /service-areas/<id>/. A service-in-a-town page
   exists only where the matrix below says so. A full grid would be about 1,000
   near identical pages, so the grid was deliberately not built. */

import { SERVICES, service, type Service, type ServiceId } from './services';
import { FLORIDA } from './site';

export type Area = 'The Pointes' | 'Lakeshore and Macomb' | 'Birmingham and Bloomfield' | 'Rochester and Troy' | 'South Florida';

export interface City {
  id: string;
  name: string;
  county: 'Macomb' | 'Oakland' | 'Wayne' | 'Broward';
  state: 'MI' | 'FL';
  area: Area;
  home?: boolean;
  /** A town we can say we work in often. */
  proven?: boolean;
}

const ALL: City[] = [
  { id: 'st-clair-shores', name: 'St. Clair Shores', county: 'Macomb', state: 'MI', area: 'Lakeshore and Macomb', home: true, proven: true },
  { id: 'grosse-pointe', name: 'Grosse Pointe', county: 'Wayne', state: 'MI', area: 'The Pointes', proven: true },
  { id: 'grosse-pointe-park', name: 'Grosse Pointe Park', county: 'Wayne', state: 'MI', area: 'The Pointes', proven: true },
  { id: 'grosse-pointe-farms', name: 'Grosse Pointe Farms', county: 'Wayne', state: 'MI', area: 'The Pointes', proven: true },
  { id: 'grosse-pointe-woods', name: 'Grosse Pointe Woods', county: 'Wayne', state: 'MI', area: 'The Pointes' },
  { id: 'grosse-pointe-shores', name: 'Grosse Pointe Shores', county: 'Wayne', state: 'MI', area: 'The Pointes' },
  { id: 'birmingham', name: 'Birmingham', county: 'Oakland', state: 'MI', area: 'Birmingham and Bloomfield', proven: true },
  { id: 'bloomfield-hills', name: 'Bloomfield Hills', county: 'Oakland', state: 'MI', area: 'Birmingham and Bloomfield' },
  { id: 'bloomfield-township', name: 'Bloomfield Township', county: 'Oakland', state: 'MI', area: 'Birmingham and Bloomfield' },
  { id: 'beverly-hills', name: 'Beverly Hills', county: 'Oakland', state: 'MI', area: 'Birmingham and Bloomfield' },
  { id: 'franklin', name: 'Franklin', county: 'Oakland', state: 'MI', area: 'Birmingham and Bloomfield' },
  { id: 'west-bloomfield', name: 'West Bloomfield', county: 'Oakland', state: 'MI', area: 'Birmingham and Bloomfield' },
  { id: 'royal-oak', name: 'Royal Oak', county: 'Oakland', state: 'MI', area: 'Birmingham and Bloomfield' },
  { id: 'huntington-woods', name: 'Huntington Woods', county: 'Oakland', state: 'MI', area: 'Birmingham and Bloomfield' },
  { id: 'troy', name: 'Troy', county: 'Oakland', state: 'MI', area: 'Rochester and Troy' },
  { id: 'rochester', name: 'Rochester', county: 'Oakland', state: 'MI', area: 'Rochester and Troy' },
  { id: 'rochester-hills', name: 'Rochester Hills', county: 'Oakland', state: 'MI', area: 'Rochester and Troy', proven: true },
  { id: 'oakland-township', name: 'Oakland Township', county: 'Oakland', state: 'MI', area: 'Rochester and Troy' },
  { id: 'lake-orion', name: 'Lake Orion', county: 'Oakland', state: 'MI', area: 'Rochester and Troy' },
  { id: 'clinton-township', name: 'Clinton Township', county: 'Macomb', state: 'MI', area: 'Lakeshore and Macomb', proven: true },
  { id: 'harrison-township', name: 'Harrison Township', county: 'Macomb', state: 'MI', area: 'Lakeshore and Macomb' },
  { id: 'macomb-township', name: 'Macomb Township', county: 'Macomb', state: 'MI', area: 'Lakeshore and Macomb' },
  { id: 'shelby-township', name: 'Shelby Township', county: 'Macomb', state: 'MI', area: 'Rochester and Troy', proven: true },
  { id: 'sterling-heights', name: 'Sterling Heights', county: 'Macomb', state: 'MI', area: 'Rochester and Troy' },
  { id: 'washington-township', name: 'Washington Township', county: 'Macomb', state: 'MI', area: 'Rochester and Troy' },
  { id: 'warren', name: 'Warren', county: 'Macomb', state: 'MI', area: 'Lakeshore and Macomb', proven: true },
  { id: 'fraser', name: 'Fraser', county: 'Macomb', state: 'MI', area: 'Lakeshore and Macomb' },
  { id: 'mount-clemens', name: 'Mount Clemens', county: 'Macomb', state: 'MI', area: 'Lakeshore and Macomb' },
  { id: 'chesterfield-township', name: 'Chesterfield Township', county: 'Macomb', state: 'MI', area: 'Lakeshore and Macomb' },
  { id: 'new-baltimore', name: 'New Baltimore', county: 'Macomb', state: 'MI', area: 'Lakeshore and Macomb' },
  { id: 'fort-lauderdale', name: 'Fort Lauderdale', county: 'Broward', state: 'FL', area: 'South Florida', proven: true },
];

/** Every town the content may name, on or off. Content validates against this list. */
export const ALL_CITIES = ALL;
export const CITIES = ALL.filter((c) => FLORIDA || c.state === 'MI');
export const city = (id: string) => CITIES.find((c) => c.id === id)!;
export const AREAS: Area[] = ['The Pointes', 'Birmingham and Bloomfield', 'Rochester and Troy', 'Lakeshore and Macomb', ...(FLORIDA ? (['South Florida'] as Area[]) : [])];
export const inArea = (a: Area) => CITIES.filter((c) => c.area === a);
export const areaId = (a: Area) => a.toLowerCase().replace(/[^a-z]+/g, '-');
export const hubPath = (c: City) => `/service-areas/${c.id}/`;
export const cityLabel = (c: City) => `${c.name}, ${c.state}`;

/** service id: towns that get their own page. */
export const MATRIX: Partial<Record<ServiceId, string[]>> = {
  'landscape-design': ['grosse-pointe', 'birmingham', 'bloomfield-hills', 'franklin', 'beverly-hills', 'west-bloomfield', 'troy', 'rochester', 'royal-oak', 'clinton-township'],
  'landscape-renovation': ['grosse-pointe', 'grosse-pointe-park', 'grosse-pointe-farms', 'birmingham', 'bloomfield-hills', 'rochester-hills'],
  'sod-installation': ['grosse-pointe', 'birmingham', 'macomb-township', 'clinton-township', 'rochester-hills', 'shelby-township', 'troy'],
  'hedge-trimming': ['grosse-pointe', 'grosse-pointe-farms', 'birmingham', 'bloomfield-hills', 'troy', 'rochester-hills', 'clinton-township', 'fort-lauderdale'],
  'landscape-maintenance': ['grosse-pointe', 'birmingham', 'bloomfield-hills', 'rochester', 'troy'],
  'cleanups': ['grosse-pointe', 'birmingham', 'rochester', 'rochester-hills', 'royal-oak', 'west-bloomfield'],
  'pressure-washing': ['grosse-pointe', 'birmingham', 'bloomfield-hills', 'rochester', 'rochester-hills', 'troy', 'royal-oak', 'west-bloomfield', 'warren', 'sterling-heights'],
  'tree-work': ['grosse-pointe', 'birmingham', 'rochester', 'rochester-hills', 'troy', 'royal-oak', 'west-bloomfield', 'warren', 'sterling-heights'],
  'stump-grinding': ['birmingham', 'bloomfield-hills', 'rochester', 'troy', 'west-bloomfield'],
  'retaining-walls': ['grosse-pointe', 'birmingham', 'rochester-hills'],
};

const slugFor = (s: Service, c: City) => `${s.townSlug}-${c.id}-${c.state.toLowerCase()}`;

/** Every service and town pair that gets its own page. */
export const TOWN_PAGES = Object.entries(MATRIX).flatMap(([sid, ids]) =>
  (ids ?? []).filter((id) => CITIES.some((c) => c.id === id)).map((id) => {
    const s = service(sid), c = city(id);
    return { service: s, city: c, slug: slugFor(s, c), key: `${s.id}--${c.id}` };
  }),
);

/** The page for one service in one town, or the main service page when it has none. */
export function townPath(s: Service, c: City): string {
  return TOWN_PAGES.some((p) => p.service.id === s.id && p.city.id === c.id) ? `/${slugFor(s, c)}/` : s.path;
}
export const hasTownPage = (s: Service, c: City) => TOWN_PAGES.some((p) => p.service.id === s.id && p.city.id === c.id);
export const townsFor = (s: Service) => TOWN_PAGES.filter((p) => p.service.id === s.id).map((p) => p.city);
