// Shop details used across the site — change them here once.
export const SHOP = {
  name:         'Sri Sai Ramakrishna',
  tagline:      'Paints & Hardware',
  // Set NEXT_PUBLIC_SITE_URL to the live address when deploying (used by Google + share previews)
  url:          process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  phoneE164:    '+919949417980',
  phoneDisplay: '+91 99494 17980',
  phoneHref:    'tel:+919949417980',
  whatsappHref: 'https://wa.me/919949417980',
  // TODO: replace with the shop's real Instagram profile
  instagramHref:   'https://www.instagram.com/your_handle/',
  instagramHandle: '@your_handle',
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

export const BRANDS = [
  'Asian Paints',
  'Berger Paints',
  'Sheenlac',
  'Saincoat',
  'JK Wall Care',
  'Birla Wall Care',
]
