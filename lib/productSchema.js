import { PRODUCT_TYPE, brands, categories } from '@/data/products'

// Validates + cleans a product coming from the admin editor.
// Shared by the editor (to show errors early) and the API (to enforce them).
// Returns { product } on success or { error } with a readable message.

const TYPES = Object.values(PRODUCT_TYPE)
const HEX_RE = /^#[0-9a-f]{6}$/i

const str = v => (typeof v === 'string' ? v.trim() : '')

function toAmount(v) {
  if (v === '' || v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 && n <= 10_000_000 ? Math.round(n) : NaN
}

function cleanPacks(packs, where) {
  if (!Array.isArray(packs)) return { error: `${where}: packs are missing` }
  const out = []
  for (const pack of packs) {
    const size  = str(pack?.size)
    const price = toAmount(pack?.price)
    const mrp   = toAmount(pack?.mrp)
    if (!size)                          return { error: `${where}: every pack needs a size (e.g. 1L, 4L, 20kg)` }
    if (size.length > 20)               return { error: `${where}: pack size "${size}" is too long` }
    if (price === null || Number.isNaN(price)) return { error: `${where}: pack ${size} needs a valid price` }
    if (Number.isNaN(mrp))              return { error: `${where}: pack ${size} has an invalid MRP` }
    if (out.some(p => p.size.toLowerCase() === size.toLowerCase())) {
      return { error: `${where}: pack size ${size} is listed twice` }
    }
    out.push(mrp === null ? { size, price } : { size, mrp, price })
  }
  return { packs: out }
}

export function validateProduct(input) {
  const name        = str(input?.name)
  const brand       = str(input?.brand)
  const category    = str(input?.category)
  const type        = str(input?.type)
  const description = str(input?.description)
  const image       = str(input?.image)
  const active      = Boolean(input?.active)

  if (!name || name.length > 120)         return { error: 'Name is required (max 120 characters)' }
  if (!brands.includes(brand) || brand === 'All')         return { error: 'Pick a brand' }
  if (!categories.includes(category) || category === 'All') return { error: 'Pick a category' }
  if (!TYPES.includes(type))              return { error: 'Pick a product type' }
  if (description.length > 500)           return { error: 'Description is too long (max 500 characters)' }
  // Only our own files or Supabase uploads: next/image crashes the page on any other host
  if (image && !/^\/(?!\/)/.test(image) && !/^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//.test(image)) {
    return { error: 'Image must be an uploaded photo' }
  }

  const product = { name, brand, category, type, description, image, active, bases: null, colors: null, packs: null }

  if (type === PRODUCT_TYPE.TINTABLE) {
    if (!Array.isArray(input.bases)) return { error: 'Add at least one base' }
    const bases = []
    for (const base of input.bases) {
      const baseName = str(base?.name)
      if (!baseName || baseName.length > 40) return { error: 'Every base needs a name (max 40 characters)' }
      if (bases.some(b => b.name.toLowerCase() === baseName.toLowerCase())) {
        return { error: `Base "${baseName}" is listed twice` }
      }
      const { packs, error } = cleanPacks(base.packs, `Base ${baseName}`)
      if (error) return { error }
      bases.push({
        id:    str(base.id) || baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name:  baseName,
        desc:  str(base.desc).slice(0, 120),
        packs,
      })
    }
    product.bases = bases
  } else {
    const { packs, error } = cleanPacks(input.packs, 'Packs')
    if (error) return { error }
    product.packs = packs
  }

  if (type === PRODUCT_TYPE.READYMIX) {
    if (!Array.isArray(input.colors) || !input.colors.length) return { error: 'Add at least one colour' }
    const colors = []
    for (const color of input.colors) {
      const colorName = str(color?.name)
      const hex = str(color?.hex)
      if (!colorName || colorName.length > 40) return { error: 'Every colour needs a name' }
      if (!HEX_RE.test(hex)) return { error: `Colour "${colorName}" needs a valid hex code like #A1B2C3` }
      if (colors.some(c => c.name.toLowerCase() === colorName.toLowerCase())) {
        return { error: `Colour "${colorName}" is listed twice` }
      }
      colors.push({ id: str(color.id) || colorName.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: colorName, hex: hex.toUpperCase() })
    }
    product.colors = colors
  }

  const orderable = type === PRODUCT_TYPE.TINTABLE
    ? product.bases.some(b => b.packs.length)
    : product.packs.length > 0
  if (active && !orderable) {
    return { error: 'Add at least one pack size with a price before making the product visible' }
  }

  return { product }
}
