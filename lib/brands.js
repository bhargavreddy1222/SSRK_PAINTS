// The brands the shop stocks — the one list every page, filter and form reads.
// `bg` / `text` are the brand's badge colours (Tailwind classes).
export const BRAND_INFO = [
  { name: 'Asian Paints',    initials: 'AP', bg: 'bg-orange-50', text: 'text-orange-700', badge: 'Top Brand', desc: "India's #1 paint brand. Full range of interior, exterior, and texture products." },
  { name: 'Berger Paints',   initials: 'BP', bg: 'bg-blue-50',   text: 'text-blue-700',   badge: 'Top Brand', desc: 'Silk, Weathercoat, Easy Clean — reliable paints for every surface.' },
  { name: 'Sheenlac',        initials: 'SL', bg: 'bg-rose-50',   text: 'text-rose-700',   badge: null, desc: 'NC lacquers and PU finishes for wood, furniture, and doors.' },
  { name: 'Saincoat',        initials: 'SC', bg: 'bg-sky-50',    text: 'text-sky-700',    badge: null, desc: 'Interior and exterior emulsions at reasonable prices.' },
  { name: 'JK Wall Care',    initials: 'JK', bg: 'bg-green-50',  text: 'text-green-700',  badge: null, desc: 'JK Cement wall care putty for a smooth, strong base coat.' },
  { name: 'Birla Wall Care', initials: 'BW', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: null, desc: 'Birla White wall care putty — high whiteness, smooth finish.' },
]

export const BRAND_NAMES = BRAND_INFO.map(b => b.name)

const FALLBACK_STYLE = { bg: 'bg-stone-100', text: 'text-stone-700' }

export const brandStyle = name => BRAND_INFO.find(b => b.name === name) ?? FALLBACK_STYLE
