import { MAX_QTY, resolveOrderLine } from './products.js'

// The rules for an order, shared by the checkout form (to show errors early)
// and the order API (to enforce them).

export const PHONE_RE = /^[6-9]\d{9}$/
// Also blocks characters that could add extra headers to the admin's mailto: link
export const EMAIL_RE = /^[^\s@<>"'(),:;?&]+@[^\s@<>"'(),:;?&]+\.[^\s@<>"'(),:;?&]+$/

export const MAX_NAME  = 100
export const MAX_EMAIL = 200
export const MAX_NOTES = 1000
export const MAX_LINES = 50

const text = value => String(value ?? '').trim()

// Returns { field: message } for whatever is wrong with the customer's details
export function customerErrors(customer) {
  const name  = text(customer?.name)
  const phone = text(customer?.phone)
  const email = text(customer?.email)
  const notes = text(customer?.notes)

  const errors = {}
  if (!name)                        errors.name  = 'Name is required'
  else if (name.length > MAX_NAME)  errors.name  = `Name is too long (max ${MAX_NAME} characters)`
  if (!PHONE_RE.test(phone))        errors.phone = 'Enter a valid 10-digit mobile number'
  // Email is optional
  if (email && (!EMAIL_RE.test(email) || email.length > MAX_EMAIL)) errors.email = 'Enter a valid email address'
  if (notes.length > MAX_NOTES)     errors.notes = `Notes are too long (max ${MAX_NOTES} characters)`
  return errors
}

// Turns what the browser sent into an order priced from `catalogue`.
// Returns { error } with a message for the customer, or { customer, lines, totals }.
export function buildOrder(payload, catalogue) {
  const errors = customerErrors(payload?.customer)
  const firstError = errors.name ?? errors.phone ?? errors.email ?? errors.notes
  if (firstError) return { error: firstError }

  const items = payload?.items
  if (!Array.isArray(items) || !items.length || items.length > MAX_LINES) {
    return { error: 'Your order is empty or too large' }
  }

  const lines = []
  for (const item of items) {
    const qty  = Number(item?.qty)
    const line = resolveOrderLine(catalogue, Number(item?.productId), item?.pack, item?.option ?? null)
    if (!line) {
      return { error: 'One of the items in your order is no longer available. Please refresh and try again.' }
    }
    if (!Number.isInteger(qty) || qty < 1) {
      return { error: `Enter a quantity for ${line.product.name}.` }
    }
    if (qty > MAX_QTY) {
      return { error: `You can order up to ${MAX_QTY} of one item online. For ${line.product.name}, please call us.` }
    }
    lines.push({
      product_id: line.product.id,
      product:    line.product.name,
      brand:      line.product.brand,
      pack:       line.pack.size,
      option:     line.option,
      price:      line.pack.price,
      qty,
      subtotal:   line.pack.price * qty,
    })
  }

  const { customer } = payload
  return {
    customer: {
      name:  text(customer.name),
      phone: text(customer.phone),
      email: text(customer.email),
      notes: text(customer.notes),
    },
    lines,
    totals: {
      total_items:     lines.reduce((sum, l) => sum + l.qty, 0),
      estimated_total: lines.reduce((sum, l) => sum + l.subtotal, 0),
    },
  }
}

// Two orders with the same signature hold exactly the same items —
// used to spot a re-sent order (see the order API)
export const orderSignature = lines =>
  lines.map(l => [l.product_id, l.pack, l.option ?? '', l.qty].join('|')).sort().join(';')
