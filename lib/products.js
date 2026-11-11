import { BRAND_NAMES } from './brands.js'

// Product rules shared by the shop, the admin editor and the order API.
// No data lives here — the catalogue itself is the Supabase `products` table.

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

const TYPES = Object.values(PRODUCT_TYPE)

// Filter options ("All" first)
export const brands = ['All', ...BRAND_NAMES]

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

// Most of one item in a single order; bigger jobs are arranged by phone
export const MAX_QTY = 999

// ── Ready-mix colour sets ─────────────────────────────────
export const ENAMEL_COLORS = [
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

export const NC_LACQUER_COLORS = [
  { id: 'cl', name: 'Clear',     hex: '#F5E6C8' },
  { id: 'wt', name: 'Walnut',    hex: '#4E2C0E' },
  { id: 'tk', name: 'Teak',      hex: '#8B5E3C' },
  { id: 'mh', name: 'Mahogany',  hex: '#6B2737' },
  { id: 'ow', name: 'Off White', hex: '#FAF7F0' },
]

export const PU_COLORS = [
  { id: 'cg', name: 'Clear Gloss', hex: '#F5E6C8' },
  { id: 'cm', name: 'Clear Matte', hex: '#EDE0C8' },
  { id: 'wt', name: 'Walnut',      hex: '#4E2C0E' },
  { id: 'tk', name: 'Teak',        hex: '#8B5E3C' },
]

export const DISTEMPER_COLORS = [
  { id: 'wh', name: 'White',    hex: '#F8F8F8' },
  { id: 'cr', name: 'Cream',    hex: '#FFFDD0' },
  { id: 'sb', name: 'Sky Blue', hex: '#87CEEB' },
  { id: 'pk', name: 'Pink',     hex: '#FFB6C1' },
  { id: 'bf', name: 'Buff',     hex: '#F0DC82' },
]

// Colour sets the admin product editor offers as presets
export const COLOR_PRESETS = {
  'Enamel colours':     ENAMEL_COLORS,
  'NC Lacquer colours': NC_LACQUER_COLORS,
  'PU Wood colours':    PU_COLORS,
  'Distemper colours':  DISTEMPER_COLORS,
}

export const filterProducts = (list, brand, category, search = '') =>
  list.filter(p => {
    const matchBrand    = brand    === 'All' || p.brand    === brand
    const matchCategory = category === 'All' || p.category === category
    const query         = search.trim().toLowerCase()
    const matchSearch   = !query ||
      [p.name, p.brand, p.category, p.description]
        .some(field => field?.toLowerCase().includes(query))
    return matchBrand && matchCategory && matchSearch
  })

// Every pack of a product, across all its bases
export const allPacks = product =>
  product.type === PRODUCT_TYPE.TINTABLE
    ? (product.bases ?? []).flatMap(base => base.packs ?? [])
    : product.packs ?? []

// Products still being filled in (no bases/packs yet) are hidden
// from the shop until they have at least one pack to order.
export const hasPacks = product => allPacks(product).length > 0

const validPack = pack =>
  typeof pack?.size === 'string' && pack.size !== '' && Number.isFinite(pack.price) && pack.price >= 0

const packsOf = value => (Array.isArray(value) ? value : []).filter(validPack)

// The product as the shop can safely show it: broken or unfinished parts
// (a base without packs, a pack without a price) are dropped, and the result
// is null when nothing orderable is left. One bad row in the database then
// hides that product instead of crashing every page that lists it.
export function shopProduct(product) {
  if (!product || !TYPES.includes(product.type) || typeof product.name !== 'string') return null

  if (product.type === PRODUCT_TYPE.TINTABLE) {
    const bases = (Array.isArray(product.bases) ? product.bases : [])
      .filter(base => typeof base?.name === 'string' && base.name !== '')
      .map(base => ({ ...base, packs: packsOf(base.packs) }))
      .filter(base => base.packs.length)
    return bases.length ? { ...product, bases } : null
  }

  const packs = packsOf(product.packs)
  if (!packs.length) return null

  if (product.type === PRODUCT_TYPE.READYMIX) {
    const colors = (Array.isArray(product.colors) ? product.colors : [])
      .filter(color => typeof color?.name === 'string' && color.name !== '' && typeof color.hex === 'string')
    return colors.length ? { ...product, packs, colors } : null
  }
  return { ...product, packs }
}

// Looks up the real product + pack for an order line in `list`.
// `option` is the base name (tintable) or colour name (readymix).
// Returns null if any part doesn't exist — used by the order API
// so prices always come from the catalogue, never from the browser.
export function resolveOrderLine(list, productId, size, option) {
  const product = list.find(p => p.id === productId)
  if (!product) return null

  let packs = product.packs
  let optionName = null
  if (product.type === PRODUCT_TYPE.TINTABLE) {
    const base = product.bases?.find(b => b.name === option)
    if (!base) return null
    packs = base.packs
    optionName = base.name
  } else if (product.type === PRODUCT_TYPE.READYMIX) {
    const color = product.colors?.find(c => c.name === option)
    if (!color) return null
    optionName = color.name
  }

  const pack = packs?.find(p => p.size === size)
  if (!pack) return null
  return { product, pack, option: optionName }
}

// Just enough of a product to rebuild a saved cart line (see /api/catalogue)
export const cartProduct = product => ({
  id:     product.id,
  name:   product.name,
  brand:  product.brand,
  image:  product.image,
  type:   product.type,
  bases:  product.bases?.map(base => ({ name: base.name, packs: base.packs })),
  colors: product.colors?.map(color => ({ name: color.name })),
  packs:  product.packs,
})

// /products/12-royale-luxury-emulsion — the number is what's looked up, the rest is for people
export function productPath(product) {
  const slug = String(product.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `/products/${product.id}${slug ? `-${slug}` : ''}`
}

export function priceRange(product) {
  const prices = allPacks(product).map(pack => pack.price)
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null
}
