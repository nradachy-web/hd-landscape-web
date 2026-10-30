/* Google reviews, word for word. The first five were read from his Google listing
   on 2026-10-30; the rest are the ones his old site quoted. A long review may be
   cut at a sentence end and is then marked `excerpt`, so the page shows an
   ellipsis. No words are changed. Names are first name and last initial.

   Nothing on the site says "every review is five stars". */

import type { ServiceId } from './services';

export interface Review {
  id: string;
  name: string;
  text: string;
  excerpt?: boolean;
  /** The rest of the review, for the reviews page. */
  more?: string;
  /** What the job was, in the review's own terms. */
  job: string;
  services: ServiceId[];
}

export const REVIEWS: Review[] = [
  { id: 'amanda-h', name: 'Amanda H.', job: 'Trees and landscaping', services: ['plant-installation', 'landscape-renovation', 'landscape-design'],
    text: 'Jake with HD Landscape did an amazing job. We are the 3rd house he did on my street and he did AMAZING for each of my neighbors and me. He is reasonably priced, and most important of all he does quality work! You can tell he cares about doing the job right, and is very passionate.', excerpt: true, more: " If i could give 10 starts i would! Everyone was on time, did the work very fast, and the clean up was also AMAZING! i would reccomend this company to everyone, you will be very pleased with the work and quality. I cant wait to continue working with jake on turning my yard into a nature oasis. Everything was amazing from our first interaction, the estimate went great and fast, and the work during and after was beyond perfect. Thank you so much again, i am loving my new trees!" },
  { id: 'rob-e', name: 'Rob E.', job: 'Full yard redo with sod', services: ['sod-installation', 'yard-grading', 'landscape-renovation', 'rock-stone', 'plant-installation'],
    text: 'Jake and his team were awesome! I had my yard completely gutted, leveled, new sod, pea gravel behind the garage and new plants. I was impressed with how clean they left the job and how efficient they were. What would’ve taken me a week was done in one day.', excerpt: true, more: " The guys working my job were super happy, professional and went over and above to make everything look perfect. I would highly recommend HD Landscape." },
  { id: 'meagan-m', name: 'Meagan M.', job: 'New landscaping', services: ['plant-installation', 'plant-watering', 'landscape-design', 'landscape-renovation'],
    text: 'Very Happy with my landscaping. Great team to work with. Very kind & pleasant. Landscaping is clean & they did a great job cleaning up. Jake called right after the team was done asking how everything went & explained in detailed the importance of watering each plant.', excerpt: true, more: " Highly recommend. Price is very fair ! Will definitely be using them for my landscaping in the spring for my backyard!!" },
  { id: 'mark-r', name: 'Mark R.', job: 'Landscaping', services: ['landscape-design', 'landscape-maintenance', 'landscape-renovation'],
    text: 'Jake is a no pressure, skilled landscaper with excellent communication abilities. Contracting, communicating and paying for services are seamless, and Jake is reliable on time estimates. Highly recommend.' },
  { id: 'nancy-g', name: 'Nancy G.', job: 'Flower bed cleanout', services: ['weeding', 'cleanups', 'plant-removal', 'landscape-maintenance'],
    text: 'Jake and his crew were very professional. They did a great job cleaning out the beds in front of our house. Over grown plants and weed which is getting too hard for this senior couple. We highly recommend!' },
  { id: 'anne-j', name: 'Anne J.', job: 'Trim, plant, mulch, tree and stump', services: ['hedge-trimming', 'stump-grinding', 'tree-work', 'mulching', 'plant-installation'],
    text: 'HD Landscape did an outstanding job. They trimmed bushes, planted new shrubs, put down mulch, cut down a tree, grinded down the tree stump and had a company repair fence for me. They were so nice and did everything I asked. They showed up on time and gave me itemized costs beforehand.' },
  { id: 'renee-g', name: 'Renee G.', job: 'Front and back yard', services: ['landscape-renovation', 'landscape-maintenance', 'cleanups'],
    text: 'Jake was quick to respond and very professional. We came up with a plan and he gave me an itemized bill which was very competitively priced. Jake and the crew arrived exactly when they said they would and the work was completed within a day. The whole crew did an amazing job, very hard working and even though it rained the entire day, they finished the job as promised.', excerpt: true, more: " It was refreshing to work with a company that delivers on all their promises, and they made sure I was satisfied before they left. Highly recommend! Thanks again Jake and crew!!" },
  { id: 'stephen-d', name: 'Stephen D.', job: 'Yard and flower beds', services: ['landscape-renovation', 'mulching', 'plant-installation'],
    text: 'This young man and his crew were nothing less than amazing. They just completed a big project for us.... his team of young men were so polite, professional, easy to get along with... They did a great job on our yard and flower beds. The owner gave us some great advice before they started, and we listened to him.. and we are so glad we did.', excerpt: true, more: " Thank you Jake and your crew, for your hard work and superior performance!! We will definitely have you guys back!" },
  { id: 'jake-m', name: 'Jake M.', job: 'Design and installation', services: ['landscape-design', 'landscape-renovation'],
    text: 'I’m more than impressed with the outstanding work done by HD Landscape and their exceptional crew. From landscape design to installation and finishing touches, they delivered nothing short of excellence.', excerpt: true, more: " The attention to detail and dedication shown by their team truly transformed my outdoor space far beyond my imagination. The level of professionalism and expertise displayed throughout the process was remarkable. Timely, efficient service and affordable pricing. I highly recommend HD Landscape for anyone seeking top-notch landscaping services!" },
  { id: 'marie-b', name: 'Marie B.', job: 'Landscaping', services: ['landscape-maintenance', 'cleanups'],
    text: 'Totally professional from start to finish. The crew was friendly and very hard working. Delivered on time and more than promised. Will use again.' },
  { id: 'gina-d', name: 'Gina D.', job: 'Landscaping', services: ['landscape-design', 'landscape-maintenance'],
    text: 'I am extremely impressed with the work HD Landscape has done. Great team - they were very responsive and communicative. Very happy we decided to work with them!' },
  { id: 'billy-w', name: 'Billy W.', job: 'Outdoor space revamp', services: ['landscape-renovation', 'landscape-design'],
    text: 'I recently had the pleasure of working with HD Landscape to completely revamp my outdoor space, and I couldn’t be happier with the results. From start to finish, the experience was seamless and exceeded my expectations in every way.' },
];

export const review = (id: string) => REVIEWS.find((r) => r.id === id);
export const forService = (id: ServiceId, n = 3) => {
  const hits = REVIEWS.filter((r) => r.services.includes(id));
  return (hits.length >= n ? hits : [...hits, ...REVIEWS.filter((r) => !hits.includes(r))]).slice(0, n);
};
