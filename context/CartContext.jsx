'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { MAX_QTY, resolveOrderLine } from '@/lib/products'

const CartContext = createContext(null)
const STORAGE_KEY = 'ssr-cart-v1'

const keyOf = (id, size, option) => `${id}-${size}-${option ?? 'none'}`

// Lines with the same product, pack and option become one line
function mergeLines(lines) {
  const byKey = new Map()
  for (const line of lines) {
    const existing = byKey.get(line._key)
    byKey.set(line._key, existing ? { ...existing, qty: Math.min(existing.qty + line.qty, MAX_QTY) } : line)
  }
  return [...byKey.values()]
}

// What was saved on this device: [{ id, size, option, qty }]
function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter(l => Number.isInteger(l?.qty) && l.qty >= 1) : []
  } catch {
    return []
  }
}

// Rebuilds saved lines from the current catalogue, so a changed
// price is picked up and removed products are dropped.
function rebuild(saved, products) {
  return mergeLines(saved.flatMap(({ id, size, option, qty }) => {
    const line = resolveOrderLine(products, id, size, option)
    if (!line) return []
    return [{ ...line.product, pack: line.pack, option: line.option, qty: Math.min(qty, MAX_QTY), _key: keyOf(id, size, option) }]
  }))
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loaded, setLoaded] = useState(false)
  // Saved lines we couldn't check (no connection) — kept in storage so they aren't lost
  const unchecked = useRef([])

  // Load after mount (localStorage isn't available during SSR, so reading it
  // during render would cause a hydration mismatch). The catalogue is only
  // fetched when there is a saved cart to check against it.
  useEffect(() => {
    const saved = readSaved()
    if (!saved.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoaded(true)
      return
    }

    let cancelled = false
    fetch('/api/catalogue')
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(products => {
        // Anything added while this was loading stays in the cart
        if (!cancelled) setCart(added => mergeLines([...rebuild(saved, products), ...added]))
      })
      .catch(() => {
        if (!cancelled) unchecked.current = saved
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      const lines = cart.map(i => ({ id: i.id, size: i.pack.size, option: i.option, qty: i.qty }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...unchecked.current, ...lines]))
    } catch {
      // storage full or blocked — cart still works for this visit
    }
  }, [cart, loaded])
  //
  // Cart item shape:
  // {
  //   id, name, brand, image, …  ← the product
  //   pack:   { size, mrp, price },   ← the selected pack (with correct price)
  //   option: string | null,     ← base name OR color name OR null
  //   qty:    number,            ← 1 … MAX_QTY
  //   _key:   string,            ← unique key: `${id}-${size}-${option}`
  // }
  //

  function addToCart(product, pack, option = null) {
    const _key = keyOf(product.id, pack.size, option)
    setCart(prev => mergeLines([...prev, { ...product, pack, option, qty: 1, _key }]))
  }

  function removeFromCart(_key) {
    setCart(prev => prev.filter(i => i._key !== _key))
  }

  function updateQty(_key, qty) {
    if (qty <= 0) { removeFromCart(_key); return }
    setCart(prev =>
      prev.map(i => i._key === _key ? { ...i, qty: Math.min(qty, MAX_QTY) } : i)
    )
  }

  function clearCart() {
    unchecked.current = []
    setCart([])
  }

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0)
  const totalPrice = cart.reduce((sum, i) => sum + i.pack.price * i.qty, 0)

  return (
    <CartContext.Provider value={{
      cart,
      loaded,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
