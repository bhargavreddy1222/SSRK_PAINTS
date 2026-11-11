import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOrder, customerErrors, orderSignature, MAX_LINES } from '../lib/orderRules.js'
import { PRODUCT_TYPE, MAX_QTY } from '../lib/products.js'

const catalogue = [
  { id: 1, name: 'Royale Shyne', brand: 'Asian Paints', type: PRODUCT_TYPE.TINTABLE,
    bases: [{ name: 'White Base', packs: [{ size: '1L', price: 380 }, { size: '4L', price: 1500 }] }] },
  { id: 3, name: 'White Putty', brand: 'Birla Wall Care', type: PRODUCT_TYPE.CLEAR, packs: [{ size: '5kg', price: 300 }] },
]
const customer = { name: ' Ravi Kumar ', phone: '9949417980', email: '', notes: '' }
const item = { productId: 1, pack: '4L', option: 'White Base', qty: 2 }

test('customerErrors accepts a normal customer and an optional email', () => {
  assert.deepEqual(customerErrors(customer), {})
  assert.deepEqual(customerErrors({ ...customer, email: 'ravi@example.com' }), {})
})

test('customerErrors names each bad field', () => {
  assert.deepEqual(Object.keys(customerErrors({})), ['name', 'phone'])
  assert.ok(customerErrors({ ...customer, name: '   ' }).name)
  assert.ok(customerErrors({ ...customer, name: 'x'.repeat(101) }).name)
  for (const phone of ['123', '5949417980', '99494179801', '99494 17980', '+919949417980']) {
    assert.ok(customerErrors({ ...customer, phone }).phone, phone)
  }
  for (const email of ['ravi', 'ravi@', 'a@b', 'a b@c.com', 'a@b.com?subject=x', 'a@b.com,c@d.com']) {
    assert.ok(customerErrors({ ...customer, email }).email, email)
  }
  assert.ok(customerErrors({ ...customer, notes: 'x'.repeat(1001) }).notes)
})

test('buildOrder prices the order from the catalogue, not from the browser', () => {
  const order = buildOrder({ customer, items: [{ ...item, price: 1, subtotal: 1 }, { productId: 3, pack: '5kg', qty: 1 }] }, catalogue)
  assert.equal(order.error, undefined)
  assert.deepEqual(order.customer, { name: 'Ravi Kumar', phone: '9949417980', email: '', notes: '' })
  assert.deepEqual(order.lines[0], {
    product_id: 1, product: 'Royale Shyne', brand: 'Asian Paints', pack: '4L', option: 'White Base', price: 1500, qty: 2, subtotal: 3000,
  })
  assert.equal(order.lines[1].option, null)
  assert.deepEqual(order.totals, { total_items: 3, estimated_total: 3300 })
})

test('buildOrder refuses bad customers, empty and oversized orders', () => {
  assert.match(buildOrder({ customer: { ...customer, phone: '1' }, items: [item] }, catalogue).error, /mobile number/)
  assert.match(buildOrder({ customer, items: [] }, catalogue).error, /empty/)
  assert.match(buildOrder({ customer }, catalogue).error, /empty/)
  assert.match(buildOrder({ customer, items: Array(MAX_LINES + 1).fill(item) }, catalogue).error, /too large/)
  assert.ok(buildOrder(null, catalogue).error)
  assert.ok(buildOrder({}, catalogue).error)
})

test('buildOrder refuses items that are not in the catalogue', () => {
  for (const bad of [{ ...item, productId: 99 }, { ...item, pack: '20L' }, { ...item, option: 'Deep Base' }, { ...item, productId: '1; drop table' }]) {
    assert.match(buildOrder({ customer, items: [bad] }, catalogue).error, /no longer available/)
  }
})

test('buildOrder explains quantity problems instead of calling the item unavailable', () => {
  for (const qty of [0, -1, 1.5, 'two', null]) {
    assert.match(buildOrder({ customer, items: [{ ...item, qty }] }, catalogue).error, /quantity/i, String(qty))
  }
  assert.equal(buildOrder({ customer, items: [{ ...item, qty: MAX_QTY }] }, catalogue).error, undefined)
  const tooMany = buildOrder({ customer, items: [{ ...item, qty: MAX_QTY + 1 }] }, catalogue).error
  assert.match(tooMany, /call us/)
  assert.match(tooMany, new RegExp(String(MAX_QTY)))
})

test('orderSignature is the same for the same items in any order, and for any key order', () => {
  const a = buildOrder({ customer, items: [item, { productId: 3, pack: '5kg', qty: 1 }] }, catalogue).lines
  const b = buildOrder({ customer, items: [{ productId: 3, pack: '5kg', qty: 1 }, item] }, catalogue).lines
  assert.equal(orderSignature(a), orderSignature(b))
  // jsonb gives keys back in a different order
  const fromDatabase = a.map(l => ({ subtotal: l.subtotal, qty: l.qty, pack: l.pack, option: l.option, product: l.product, product_id: l.product_id }))
  assert.equal(orderSignature(fromDatabase), orderSignature(a))
  const different = buildOrder({ customer, items: [{ ...item, qty: 3 }, { productId: 3, pack: '5kg', qty: 1 }] }, catalogue).lines
  assert.notEqual(orderSignature(different), orderSignature(a))
})
