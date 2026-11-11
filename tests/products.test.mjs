import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PRODUCT_TYPE, MAX_QTY, allPacks, cartProduct, filterProducts, hasPacks,
  priceRange, productPath, resolveOrderLine, shopProduct,
} from '../lib/products.js'

const tintable = {
  id: 1, name: 'Royale Shyne', brand: 'Asian Paints', category: 'Interior', type: PRODUCT_TYPE.TINTABLE,
  description: 'Soft sheen', image: '/a.jpg', active: true,
  bases: [
    { id: 'wb', name: 'White Base', desc: 'Light shades', packs: [{ size: '1L', mrp: 800, price: 380 }, { size: '4L', mrp: 3000, price: 1500 }] },
    { id: 'db', name: 'Deep Base',  desc: 'Dark shades',  packs: [{ size: '1L', mrp: 800, price: 420 }] },
  ],
}
const readymix = {
  id: 2, name: 'Synthetic Enamel', brand: 'Sheenlac', category: 'Enamel', type: PRODUCT_TYPE.READYMIX,
  description: 'High gloss', image: '', active: true,
  colors: [{ id: 'wh', name: 'White', hex: '#F5F5F5' }, { id: 'bk', name: 'Black', hex: '#1C1C1C' }],
  packs: [{ size: '500ml', mrp: 200, price: 160 }, { size: '1L', mrp: 350, price: 300 }],
}
const clear = {
  id: 3, name: 'White Putty', brand: 'Birla Wall Care', category: 'Wall Putty', type: PRODUCT_TYPE.CLEAR,
  description: 'Smooth finish', image: '', active: true,
  packs: [{ size: '5kg', price: 300 }],
}
const list = [tintable, readymix, clear]

test('resolveOrderLine finds the pack for the chosen base, with that base\'s price', () => {
  const line = resolveOrderLine(list, 1, '1L', 'Deep Base')
  assert.equal(line.pack.price, 420)
  assert.equal(line.option, 'Deep Base')
  assert.equal(line.product.id, 1)
})

test('resolveOrderLine: ready-mix needs a real colour, clear products need none', () => {
  assert.equal(resolveOrderLine(list, 2, '1L', 'Black').pack.price, 300)
  assert.equal(resolveOrderLine(list, 2, '1L', 'Purple'), null)
  assert.equal(resolveOrderLine(list, 2, '1L', null), null)
  const line = resolveOrderLine(list, 3, '5kg', null)
  assert.equal(line.pack.price, 300)
  assert.equal(line.option, null)
})

test('resolveOrderLine rejects unknown products, bases and sizes', () => {
  assert.equal(resolveOrderLine(list, 99, '1L', 'White Base'), null)
  assert.equal(resolveOrderLine(list, 1, '1L', 'Medium Base'), null)
  assert.equal(resolveOrderLine(list, 1, '4L', 'Deep Base'), null) // that base has no 4L
  assert.equal(resolveOrderLine(list, '1', '1L', 'White Base'), null) // ids are numbers
})

test('resolveOrderLine survives a product with missing parts', () => {
  const broken = [{ id: 7, type: PRODUCT_TYPE.TINTABLE }, { id: 8, type: PRODUCT_TYPE.READYMIX, packs: [] }]
  assert.equal(resolveOrderLine(broken, 7, '1L', 'White Base'), null)
  assert.equal(resolveOrderLine(broken, 8, '1L', 'White'), null)
})

test('hasPacks / allPacks / priceRange', () => {
  assert.equal(hasPacks(tintable), true)
  assert.equal(hasPacks({ type: PRODUCT_TYPE.TINTABLE, bases: [] }), false)
  assert.equal(hasPacks({ type: PRODUCT_TYPE.TINTABLE, bases: [{ name: 'x', packs: [] }] }), false)
  assert.equal(hasPacks({ type: PRODUCT_TYPE.CLEAR }), false)
  assert.equal(allPacks(tintable).length, 3)
  assert.deepEqual(priceRange(tintable), { min: 380, max: 1500 })
  assert.equal(priceRange({ type: PRODUCT_TYPE.CLEAR, packs: [] }), null)
})

test('shopProduct keeps good products as they are', () => {
  assert.deepEqual(shopProduct(tintable), tintable)
  assert.deepEqual(shopProduct(readymix), readymix)
  assert.deepEqual(shopProduct(clear), clear)
})

test('shopProduct drops unfinished parts and hides products with nothing to order', () => {
  const partial = shopProduct({
    ...tintable,
    bases: [
      ...tintable.bases,
      { id: 'mb', name: 'Medium Base', packs: [] },             // no packs yet
      { id: 'xb', name: 'Extra Base', packs: [{ size: '1L' }] }, // pack without a price
      { id: 'nb', packs: [{ size: '1L', price: 10 }] },          // base without a name
    ],
  })
  assert.deepEqual(partial.bases.map(b => b.name), ['White Base', 'Deep Base'])

  assert.equal(shopProduct({ ...tintable, bases: null }), null)
  assert.equal(shopProduct({ ...tintable, bases: [] }), null)
  assert.equal(shopProduct({ ...readymix, colors: null }), null) // would have crashed the product card
  assert.equal(shopProduct({ ...readymix, colors: [] }), null)
  assert.equal(shopProduct({ ...clear, packs: undefined }), null)
  assert.equal(shopProduct({ ...clear, packs: [{ size: '', price: 5 }, { size: '1kg', price: -1 }, { size: '2kg', price: '40' }] }), null)
  assert.equal(shopProduct({ ...clear, type: 'mystery' }), null)
  assert.equal(shopProduct(null), null)
})

test('filterProducts filters by brand, category and search text', () => {
  assert.equal(filterProducts(list, 'All', 'All').length, 3)
  assert.deepEqual(filterProducts(list, 'Sheenlac', 'All').map(p => p.id), [2])
  assert.deepEqual(filterProducts(list, 'All', 'Wall Putty').map(p => p.id), [3])
  assert.deepEqual(filterProducts(list, 'All', 'All', '  SHEEN ').map(p => p.id), [1, 2]) // name, brand or description
  assert.deepEqual(filterProducts(list, 'Asian Paints', 'Enamel'), [])
})

test('cartProduct keeps prices and names but not descriptions', () => {
  const slim = cartProduct(tintable)
  assert.equal(slim.description, undefined)
  assert.deepEqual(slim.bases[0], { name: 'White Base', packs: tintable.bases[0].packs })
  // A saved cart line can still be rebuilt from the slim version
  assert.equal(resolveOrderLine([slim, cartProduct(readymix)], 1, '4L', 'White Base').pack.price, 1500)
  assert.equal(resolveOrderLine([slim, cartProduct(readymix)], 2, '500ml', 'White').pack.price, 160)
})

test('productPath builds a readable address', () => {
  assert.equal(productPath({ id: 12, name: 'Royale Luxury Emulsion' }), '/products/12-royale-luxury-emulsion')
  assert.equal(productPath({ id: 5, name: '  NC Lacquer (Clear) & PU!  ' }), '/products/5-nc-lacquer-clear-pu')
  assert.equal(productPath({ id: 9, name: 'రంగు' }), '/products/9')
})

test('MAX_QTY is a sane limit', () => {
  assert.ok(Number.isInteger(MAX_QTY) && MAX_QTY > 0)
})
