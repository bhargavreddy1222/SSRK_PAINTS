// ─────────────────────────────────────────────────────────
//  Product type — determines what options the user selects
//  'tintable' → choose a Base  (emulsions, exterior paints)
//  'readymix' → choose a Color (enamels, lacquers, distemper)
//  'clear'    → no color choice (putty, primer, hardware)
// ─────────────────────────────────────────────────────────
export const PRODUCT_TYPE = {
  TINTABLE: 'tintable',
  READYMIX: 'readymix',
  CLEAR:    'clear',
}

export const brands = [
  'All',
  'Asian Paints',
  'Berger Paints',
  'Sheenlac',
  'Saincoat',
  'JK Wall Care',
  'Birla Wall Care',
]

export const categories = [
  'All',
  'Interior',
  'Exterior',
  'Wood Finish',
  'Enamel',
  'Wall Putty',
  'Primer',
  'Hardware',
]

// ── Enamel ready-mix colors ───────────────────────────────
const ENAMEL_COLORS = [
  { id: 'wh', name: 'White',         hex: '#F5F5F5' },
  { id: 'iv', name: 'Ivory',         hex: '#FFFFF0' },
  { id: 'cr', name: 'Cream',         hex: '#FFFDD0' },
  { id: 'gy', name: 'Golden Yellow', hex: '#FFC200' },
  { id: 'br', name: 'Brown',         hex: '#7B3F00' },
  { id: 'bg', name: 'Bus Green',     hex: '#1A5C35' },
  { id: 'sr', name: 'Signal Red',    hex: '#C8102E' },
  { id: 'bk', name: 'Black',         hex: '#1C1C1C' },
  { id: 'sb', name: 'Sky Blue',      hex: '#5B9BD5' },
  { id: 'al', name: 'Aluminium',     hex: '#A9A9A9' },
]

// ── NC Lacquer colors ─────────────────────────────────────
const NC_LACQUER_COLORS = [
  { id: 'cl', name: 'Clear',     hex: '#F5E6C8' },
  { id: 'wt', name: 'Walnut',    hex: '#4E2C0E' },
  { id: 'tk', name: 'Teak',      hex: '#8B5E3C' },
  { id: 'mh', name: 'Mahogany',  hex: '#6B2737' },
  { id: 'ow', name: 'Off White', hex: '#FAF7F0' },
]

// ── PU Wood Finish colors ─────────────────────────────────
const PU_COLORS = [
  { id: 'cg', name: 'Clear Gloss', hex: '#F5E6C8' },
  { id: 'cm', name: 'Clear Matte', hex: '#EDE0C8' },
  { id: 'wt', name: 'Walnut',      hex: '#4E2C0E' },
  { id: 'tk', name: 'Teak',        hex: '#8B5E3C' },
]

// ── Distemper colors ──────────────────────────────────────
const DISTEMPER_COLORS = [
  { id: 'wh', name: 'White',    hex: '#F8F8F8' },
  { id: 'cr', name: 'Cream',    hex: '#FFFDD0' },
  { id: 'sb', name: 'Sky Blue', hex: '#87CEEB' },
  { id: 'pk', name: 'Pink',     hex: '#FFB6C1' },
  { id: 'bf', name: 'Buff',     hex: '#F0DC82' },
]


// ─────────────────────────────────────────────────────────
//  STRUCTURE EXPLAINED
//
//  TINTABLE product:
//    bases: [
//      { id, name, desc, packs: [{ size, price }, ...] }
//    ]
//    → Each base has its OWN pack sizes and prices
//    → No top-level packs array
//
//  READYMIX product:
//    colors: [{ id, name, hex }]
//    packs:  [{ size, price }]   ← same price for all colors
//
//  CLEAR product:
//    packs: [{ size, price }]    ← just pick a size
// ─────────────────────────────────────────────────────────

export const products = [

  // ╔══════════════════════════════════════════════════════╗
  // ║  ASIAN PAINTS                                        ║
  // ╚══════════════════════════════════════════════════════╝

  {
    id: 1,
    brand:    'Asian Paints',
    name:     'Royale Luxury Emulsion',
    category: 'Interior',
    type:     PRODUCT_TYPE.TINTABLE,
    description: 'Premium smooth-finish interior emulsion with washability and rich colour depth.',
    bases: [
      {
        id: 'wb', name: 'White Base', desc: 'For white and light pastel shades',
        packs: [
          { size: '1L', mrp: 1000, price: 850   },
          { size: '4L', mrp: 3800, price: 3200  },
          { size: '10L', mrp: 9000, price: 7800  },
          { size: '20L', mrp: 18000, price: 15000 },
        ],
      },
      {
        id: 'mb', name: 'Medium Base', desc: 'For medium and mid-tone shades',
        packs: [
          { size: '1L', mrp: 1000, price: 875   },
          { size: '4L', mrp: 3800, price: 3300  },
          { size: '10L', mrp: 9000, price: 8050  },
          { size: '20L', mrp: 18000, price: 15500 },
        ],
      },
      {
        id: 'db', name: 'Deep Base', desc: 'For dark and deep shades',
        packs: [
          { size: '1L', mrp: 1000, price: 900   },
          { size: '4L', mrp: 3800, price: 3400  },
          { size: '10L', mrp: 9000, price: 8300  },
          { size: '20L', mrp: 18000, price: 16000 },
        ],
      },
    ],
  },

  {
    id: 2,
    brand:    'Asian Paints',
    name:     'Apex Exterior Emulsion',
    category: 'Exterior',
    type:     PRODUCT_TYPE.TINTABLE,
    description: 'Weatherproof exterior emulsion, UV and rain resistant with long-lasting colour.',
    bases: [
      {
        id: 'wb', name: 'White Base', desc: 'For white and light pastel shades',
        packs: [
          { size: '1L', mrp: 800, price: 620   },
          { size: '4L', mrp: 3000, price: 2350  },
          { size: '10L', mrp: 7000, price: 5600  },
          { size: '20L', mrp: 14000, price: 10800 },
        ],
      },
      {
        id: 'mb', name: 'Medium Base', desc: 'For medium and mid-tone shades',
        packs: [
          { size: '1L', mrp: 800, price: 640   },
          { size: '4L', mrp: 3000, price: 2430  },
          { size: '10L', mrp: 7000, price: 5800  },
          { size: '20L', mrp: 14000, price: 11200 },
        ],
      },
      {
        id: 'db', name: 'Deep Base', desc: 'For dark and deep shades',
        packs: [
          { size: '1L', mrp: 800, price: 660   },
          { size: '4L', mrp: 3000, price: 2500  },
          { size: '10L', mrp: 7000, price: 6000  },
          { size: '20L', mrp: 14000, price: 11600 },
        ],
      },
    ],
  },

  {
    id: 3,
    brand:    'Asian Paints',
    name:     'Tractor Emulsion',
    category: 'Interior',
    type:     PRODUCT_TYPE.TINTABLE,
    description: 'Economy interior emulsion with good coverage and clean, smooth finish.',
    bases: [
      {
        id: 'wb', name: 'White Base', desc: 'For white and light pastel shades',
        packs: [
          { size: '4L', mrp: 1000, price: 1050 },
          { size: '10L', mrp: 2500, price: 2500 },
          { size: '20L', mrp: 4800, price: 4800 },
        ],
      },
      {
        id: 'mb', name: 'Medium Base', desc: 'For medium and mid-tone shades',
        packs: [
          { size: '4L', mrp: 1100, price: 1100 },
          { size: '10L', mrp: 2620, price: 2620 },
          { size: '20L', mrp: 5000, price: 5000 },
        ],
      },
      {
        id: 'db', name: 'Deep Base', desc: 'For dark and deep shades',
        packs: [
          { size: '4L', mrp: 1150, price: 1150 },
          { size: '10L', mrp: 2750, price: 2750 },
          { size: '20L', mrp: 5250, price: 5250 },
        ],
      },
    ],
  },

  {
    id: 4,
    brand:    'Asian Paints',
    name:     'Wall Primer',
    category: 'Primer',
    type:     PRODUCT_TYPE.CLEAR,
    description: 'Interior wall primer for better adhesion and uniform paint coverage.',
    packs: [
      { size: '4L', mrp: 1000, price: 880  },
      { size: '10L', mrp: 2500, price: 2100 },
      { size: '20L', mrp: 4800, price: 4000 },
    ],
  },


  // ╔══════════════════════════════════════════════════════╗
  // ║  BERGER PAINTS                                       ║
  // ╚══════════════════════════════════════════════════════╝

  {
    id: 5,
    brand:    'Berger Paints',
    name:     'Silk Luxury Emulsion',
    category: 'Interior',
    type:     PRODUCT_TYPE.TINTABLE,
    description: 'Smooth silky finish emulsion with high sheen and excellent washability.',
    bases: [
      {
        id: 'wb', name: 'White Base', desc: 'For white and light pastel shades',
        packs: [
          { size: '1L', mrp: 800, price: 780   },
          { size: '4L', mrp: 3000, price: 2950  },
          { size: '10L', mrp: 7000, price: 7200  },
          { size: '20L', mrp: 14000, price: 13800 },
        ],
      },
      {
        id: 'mb', name: 'Medium Base', desc: 'For medium and mid-tone shades',
        packs: [
          { size: '1L', mrp: 800, price: 800   },
          { size: '4L', mrp: 3000, price: 3050  },
          { size: '10L', mrp: 7000, price: 7450  },
          { size: '20L', mrp: 14000, price: 14300 },
        ],
      },
      {
        id: 'db', name: 'Deep Base', desc: 'For dark and deep shades',
        packs: [
          { size: '1L', mrp: 800, price: 820   },
          { size: '4L', mrp: 3000, price: 3150  },
          { size: '10L', mrp: 7000, price: 7700  },
          { size: '20L', mrp: 14000, price: 14800 },
        ],
      },
    ],
  },

  {
    id: 6,
    brand:    'Berger Paints',
    name:     'Weathercoat',
    category: 'Exterior',
    type:     PRODUCT_TYPE.TINTABLE,
    description: 'All-weather exterior protection — durable, fade-resistant, and anti-algal.',
    bases: [
      {
        id: 'wb', name: 'White Base', desc: 'For white and light pastel shades',
        packs: [
          { size: '1L', mrp: 800, price: 580   },
          { size: '4L', mrp: 3000, price: 2200  },
          { size: '10L', mrp: 7000, price: 5300  },
          { size: '20L', mrp: 14000, price: 10200 },
        ],
      },
      {
        id: 'mb', name: 'Medium Base', desc: 'For medium and mid-tone shades',
        packs: [
          { size: '1L', mrp: 800, price: 600   },
          { size: '4L', mrp: 3000, price: 2280  },
          { size: '10L', mrp: 7000, price: 5500  },
          { size: '20L', mrp: 14000, price: 10600 },
        ],
      },
      {
        id: 'db', name: 'Deep Base', desc: 'For dark and deep shades',
        packs: [
          { size: '1L', mrp: 800, price: 620   },
          { size: '4L', mrp: 3000, price: 2350  },
          { size: '10L', mrp: 7000, price: 5700  },
          { size: '20L', mrp: 14000, price: 11000 },
        ],
      },
    ],
  },


  // ╔══════════════════════════════════════════════════════╗
  // ║  SHEENLAC                                            ║
  // ╚══════════════════════════════════════════════════════╝

  {
    id: 7,
    brand:    'Sheenlac',
    name:     'Synthetic Enamel',
    category: 'Enamel',
    type:     PRODUCT_TYPE.READYMIX,
    description: 'High-gloss synthetic enamel for wood and metal surfaces. Hard, durable finish.',
    colors: ENAMEL_COLORS,
    packs: [
      { size: '500ml', mrp: 200, price: 160  },
      { size: '1L',    mrp: 350, price: 300  },
      { size: '4L',    mrp: 1200, price: 1100 },
    ],
  },

  {
    id: 8,
    brand:    'Sheenlac',
    name:     'NC Lacquer',
    category: 'Wood Finish',
    type:     PRODUCT_TYPE.READYMIX,
    description: 'Fast-drying nitrocellulose lacquer for wooden furniture, doors, and cabinets.',
    colors: NC_LACQUER_COLORS,
    packs: [
      { size: '500ml', mrp: 250, price: 210  },
      { size: '1L',    mrp: 450, price: 390  },
      { size: '4L',    mrp: 1600, price: 1400 },
    ],
  },

  {
    id: 9,
    brand:    'Sheenlac',
    name:     'PU Wood Finish',
    category: 'Wood Finish',
    type:     PRODUCT_TYPE.READYMIX,
    description: 'Premium polyurethane finish — hard, glossy, and long-lasting for all wood surfaces.',
    colors: PU_COLORS,
    packs: [
      { size: '500ml', mrp: 300, price: 340  },
      { size: '1L',    mrp: 600, price: 640  },
      { size: '4L',    mrp: 2400, price: 2400 },
    ],
  },


  // ╔══════════════════════════════════════════════════════╗
  // ║  SAINCOAT                                            ║
  // ╚══════════════════════════════════════════════════════╝

  {
    id: 10,
    brand:    'Saincoat',
    name:     'Interior Emulsion',
    category: 'Interior',
    type:     PRODUCT_TYPE.TINTABLE,
    description: 'Affordable interior emulsion with smooth finish and good coverage.',
    bases: [
      {
        id: 'wb', name: 'White Base', desc: 'For white and light pastel shades',
        packs: [
          { size: '4L', mrp: 1000, price: 950  },
          { size: '10L', mrp: 2500, price: 2300 },
          { size: '20L', mrp: 5000, price: 4400 },
        ],
      },
      {
        id: 'mb', name: 'Medium Base', desc: 'For medium and mid-tone shades',
        packs: [
          { size: '4L', mrp: 1000, price: 990  },
          { size: '10L', mrp: 2500, price: 2400 },
          { size: '20L', mrp: 5000, price: 4600 },
        ],
      },
      {
        id: 'db', name: 'Deep Base', desc: 'For dark and deep shades',
        packs: [
          { size: '4L', mrp: 1000, price: 1030 },
          { size: '10L', mrp: 2500, price: 2500 },
          { size: '20L', mrp: 5000, price: 4800 },
        ],
      },
    ],
  },

  {
    id: 11,
    brand:    'Saincoat',
    name:     'Exterior Emulsion',
    category: 'Exterior',
    type:     PRODUCT_TYPE.TINTABLE,
    description: 'Budget-friendly exterior emulsion, weather resistant with decent coverage.',
    bases: [
      {
        id: 'wb', name: 'White Base', desc: 'For white and light pastel shades',
        packs: [
          { size: '4L', mrp: 1200, price: 1100 },
          { size: '10L', mrp: 3000, price: 2700 },
          { size: '20L', mrp: 6000, price: 5200 },
        ],
      },
      {
        id: 'mb', name: 'Medium Base', desc: 'For medium and mid-tone shades',
        packs: [
          { size: '4L', mrp: 1200, price: 1140 },
          { size: '10L', mrp: 3000, price: 2800 },
          { size: '20L', mrp: 6000, price: 5400 },
        ],
      },
      {
        id: 'db', name: 'Deep Base', desc: 'For dark and deep shades',
        packs: [
          { size: '4L', mrp: 1200, price: 1180 },
          { size: '10L', mrp: 3000, price: 2900 },
          { size: '20L', mrp: 6000, price: 5600 },
        ],
      },
    ],
  },

  {
    id: 14,
    brand:    'Saincoat',
    name:     'Distemper',
    category: 'Interior',
    type:     PRODUCT_TYPE.READYMIX,
    description: 'Economy distemper in pre-mixed shades for interior walls. Easy to apply.',
    colors: DISTEMPER_COLORS,
    packs: [
      { size: '5kg',  mrp: 500, price: 450  },
      { size: '10kg', mrp: 900, price: 880  },
      { size: '20kg', mrp: 1800, price: 1700 },
    ],
  },


  // ╔══════════════════════════════════════════════════════╗
  // ║  JK WALL CARE                                        ║
  // ╚══════════════════════════════════════════════════════╝

  {
    id: 12,
    brand:    'JK Wall Care',
    name:     'White Cement Putty',
    category: 'Wall Putty',
    type:     PRODUCT_TYPE.CLEAR,
    description: 'Strong base coat putty with excellent adhesion — ideal for new walls.',
    packs: [
      { size: '5kg', mrp: 300, price: 280  },
      { size: '10kg', mrp: 600, price: 540  },
      { size: '25kg', mrp: 1500, price: 1300 },
      { size: '40kg', mrp: 2400, price: 2000 },
    ],
  },


  // ╔══════════════════════════════════════════════════════╗
  // ║  BIRLA WALL CARE                                     ║
  // ╚══════════════════════════════════════════════════════╝

  {
    id: 13,
    brand:    'Birla Wall Care',
    name:     'White Putty',
    category: 'Wall Putty',
    type:     PRODUCT_TYPE.CLEAR,
    description: 'Birla White wall care putty — high whiteness, smooth finish, strong adhesion.',
    packs: [
      { size: '5kg',  mrp: 300, price: 300  },
      { size: '10kg', mrp: 600, price: 580  },
      { size: '25kg', mrp: 1500, price: 1400 },
      { size: '40kg', mrp: 2400, price: 2200 },
    ],
  },
]


// ── Helpers ───────────────────────────────────────────────

export const filterProducts = (list, brand, category, search = '') =>
  list.filter(p => {
    const matchBrand    = brand    === 'All' || p.brand    === brand
    const matchCategory = category === 'All' || p.category === category
    const matchSearch   = !search  ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    return matchBrand && matchCategory && matchSearch
  })

// Returns all available pack sizes for a product (used for display)
export const getAvailablePacks = (product, baseId = null) => {
  if (product.type === PRODUCT_TYPE.TINTABLE) {
    const base = baseId
      ? product.bases.find(b => b.id === baseId)
      : product.bases[0]
    return base?.packs ?? []
  }
  return product.packs ?? []
}

// Returns price for a specific base + size combination
export const getPrice = (product, baseId, size) => {
  if (product.type === PRODUCT_TYPE.TINTABLE) {
    const base = product.bases.find(b => b.id === baseId)
    const pack = base?.packs.find(p => p.size === size)
    return pack?.price ?? null
  }
  return product.packs?.find(p => p.size === size)?.price ?? null
}