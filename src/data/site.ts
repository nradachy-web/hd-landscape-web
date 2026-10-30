/* Every business fact in one place. A page never types a phone number, a rating
   or a link: it reads them from here.  */

export const BRAND = {
  name: 'HD Landscape',
  legalName: 'HD Landscape LLC',
  owner: 'Jake Hendricks',
  phone: '(586) 718-8762',
  phoneHref: 'tel:+15867188762',
  smsHref: 'sms:+15867188762',
  phoneE164: '+15867188762',
  email: 'hdlandscapecorp@gmail.com',
  /* A service area business: no street address is printed. */
  city: 'St. Clair Shores',
  state: 'MI',
  region: 'Metro Detroit',
  origin: 'https://hdlandscapellc.com',
};

export const RATING = {
  value: '5.0',
  count: 171,
  countLabel: '171',
  asOf: '2026-10-30',
};

export const LINKS = {
  google: 'https://www.google.com/maps/place/HD+Landscape/data=!4m2!3m1!1s0xa1f4b503bcb01a0b:0x296d0010c14b2eda',
  facebook: 'https://www.facebook.com/hdlandscapellc1',
  tiktok: 'https://www.tiktok.com/@hd_landscape1',
};

/* From the old About page. */
export const STATS = { projects: '200+', areas: '12+' };

export const FORM = {
  /* Web3Forms key. Empty until the form is created and a real test arrives: an
     empty key shows the phone number instead of pretending to send. */
  key: import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '',
  endpoint: 'https://api.web3forms.com/submit',
};

export const TRACKING = {
  /* His existing GA4 property, kept so history carries over. */
  ga4: 'G-4V958PQCMZ',
  host: 'hdlandscapellc.com',
};

/* One switch for the South Florida season pages. Off removes them everywhere. */
export const FLORIDA = true;
