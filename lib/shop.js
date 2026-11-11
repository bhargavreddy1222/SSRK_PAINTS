// The site's public address, used by Google and share previews (sitemap, robots.txt,
// Open Graph, business details). Set NEXT_PUBLIC_SITE_URL once the shop has its own
// domain; until then Vercel's production address is used so nothing points at localhost.
const vercelHost = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelHost ? `https://${vercelHost}` : 'http://localhost:3000')
).replace(/\/+$/, '')

const INSTAGRAM = ''

// Shop details used across the site — change them here once.
export const SHOP = {
  name:         'Sri Sai Ramakrishna',
  tagline:      'Paints & Hardware',
  url:          SITE_URL,
  phoneE164:    '+919949417980',
  phoneDisplay: '+91 99494 17980',
  phoneHref:    'tel:+919949417980',
  whatsappHref: 'https://wa.me/919949417980',
  // Instagram username without the @ (e.g. 'srisaipaints'). While it's empty the
  // site shows no Instagram links.
  instagramHandle: INSTAGRAM ? `@${INSTAGRAM}` : '',
  instagramHref:   INSTAGRAM ? `https://www.instagram.com/${INSTAGRAM}/` : '',
  addressLine:  '1st Line, Buchaiah Thota',
  city:         'Guntur, Andhra Pradesh 522001',
  locality:     'Guntur',
  region:       'Andhra Pradesh',
  postalCode:   '522001',
  mapsHref:    'https://share.google/SV44unc6GWj0dw246',
  mapsEmbed:    'https://www.google.com/maps?q=Buchaiah+Thota,+Guntur,+Andhra+Pradesh+522001&output=embed',
  hours:        [
    { days: 'Mon – Sat', time: '9am – 8pm',  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '20:00' },
    { days: 'Sunday',    time: '10am – 5pm', dayOfWeek: ['Sunday'], opens: '10:00', closes: '17:00' },
  ],
}
