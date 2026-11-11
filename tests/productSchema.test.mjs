import test from 'node:test'
import assert from 'node:assert/strict'
import { validateProduct } from '../lib/productSchema.js'

const clear = {
  name: ' White Putty ', brand: 'Birla Wall Care', category: 'Wall Putty', type: 'clear',
  description: 'Smooth', image: '', active: true,
  packs: [{ size: '5kg', mrp: '300', price: '280' }],
}
const tintable = {
  name: 'Royale', brand: 'Asian Paints', category: 'Interior', type: 'tintable', active: true,
  bases: [{ name: 'White Base', desc: 'Light', packs: [{ size: '1L', mrp: 800, price: 620 }] }],
}
const readymix = {
  name: 'Enamel', brand: 'Sheenlac', category: 'Enamel', type: 'readymix', active: true,
  colors: [{ name: 'White', hex: '#f5f5f5' }],
  packs: [{ size: '1L', price: 300 }],
}

test('a valid product is cleaned up', () => {
  const { product, error } = validateProduct(clear)
  assert.equal(error, undefined)
  assert.equal(product.name, 'White Putty')
  assert.deepEqual(product.packs, [{ size: '5kg', mrp: 300, price: 280 }])
  assert.equal(product.bases, null)
  assert.equal(product.colors, null)
})

test('tintable and ready-mix products keep their options', () => {
  const t = validateProduct(tintable).product
  assert.equal(t.packs, null)
  assert.equal(t.bases[0].id, 'white-base')
  const r = validateProduct(readymix).product
  assert.deepEqual(r.colors, [{ id: 'white', name: 'White', hex: '#F5F5F5' }])
  assert.deepEqual(r.packs, [{ size: '1L', price: 300 }]) // no MRP is fine
})

test('a price above its MRP is refused; equal or below is fine', () => {
  assert.match(validateProduct({ ...clear, packs: [{ size: '5kg', mrp: 300, price: 301 }] }).error, /above its MRP/)
  assert.equal(validateProduct({ ...clear, packs: [{ size: '5kg', mrp: 300, price: 300 }] }).error, undefined)
  assert.match(
    validateProduct({ ...tintable, bases: [{ name: 'White Base', packs: [{ size: '4L', mrp: 2000, price: 2680 }] }] }).error,
    /Base White Base: pack 4L is priced above its MRP/
  )
})

test('required fields and bad values are refused', () => {
  assert.ok(validateProduct(null).error)
  assert.ok(validateProduct({ ...clear, name: '' }).error)
  assert.ok(validateProduct({ ...clear, brand: 'All' }).error)
  assert.ok(validateProduct({ ...clear, brand: 'Unknown' }).error)
  assert.ok(validateProduct({ ...clear, category: 'All' }).error)
  assert.ok(validateProduct({ ...clear, type: 'liquid' }).error)
  assert.ok(validateProduct({ ...clear, packs: [{ size: '', price: 1 }] }).error)
  assert.ok(validateProduct({ ...clear, packs: [{ size: '5kg', price: '' }] }).error)
  assert.ok(validateProduct({ ...clear, packs: [{ size: '5kg', price: -5 }] }).error)
  assert.ok(validateProduct({ ...clear, packs: [{ size: '5kg', price: 1 }, { size: '5KG', price: 2 }] }).error)
  assert.ok(validateProduct({ ...readymix, colors: [] }).error)
  assert.ok(validateProduct({ ...readymix, colors: [{ name: 'White', hex: 'white' }] }).error)
  assert.ok(validateProduct({ ...tintable, bases: 'none' }).error)
})

test('a visible product must have something to order', () => {
  assert.ok(validateProduct({ ...clear, packs: [] }).error)
  assert.equal(validateProduct({ ...clear, packs: [], active: false }).error, undefined)
})

test('photos must be our own files or uploads to our own Supabase project', () => {
  const upload = 'https://abcd.supabase.co/storage/v1/object/public/product-images/products/x.jpg'
  assert.equal(validateProduct({ ...clear, image: '/image/asian/a.jpg' }).error, undefined)
  assert.equal(validateProduct({ ...clear, image: upload }).error, undefined)
  assert.equal(validateProduct({ ...clear, image: upload }, { imageHost: 'abcd.supabase.co' }).error, undefined)
  assert.ok(validateProduct({ ...clear, image: upload }, { imageHost: 'other.supabase.co' }).error)
  assert.ok(validateProduct({ ...clear, image: 'https://evil.example/a.jpg' }).error)
  assert.ok(validateProduct({ ...clear, image: '//evil.example/a.jpg' }).error)
  assert.ok(validateProduct({ ...clear, image: 'javascript:alert(1)' }).error)
})
