'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { resolveOrderLine } from '@/data/products'

const CartContext = createContext(null)
const STORAGE_KEY = 'ssr-cart-v1'

// Rebuilds saved cart lines from the current product data, so a
// changed price is picked up and removed products are dropped.
function loadCart(products) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return saved.flatMap(({ id, size, option, qty }) => {
      const line = resolveOrderLine(products, id, size, option)
      if (!line || !Number.isInteger(qty) || qty < 1) return []
      const _key = `${id}-${size}-${option ?? 'none'}`
      return [{ ...line.product, pack: line.pack, option: line.option, qty, _key }]
    })
  } catch {
    return []
  }
}

export function CartProvider({ products, children }) {
  const [cart, setCart] = useState([])
  const [loaded, setLoaded] = useState(false)

  // Load after mount (localStorage isn't available during SSR,
  // so reading it during render would cause a hydration mismatch)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(loadCart(products))
    setLoaded(true)
  }, [products])

  useEffect(() => {
    if (!loaded) return
    try {
      const saved = cart.map(i => ({ id: i.id, size: i.pack.size, option: i.option, qty: i.qty }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // storage full or blocked — cart still works for this visit
    }
  }, [cart, loaded])
  //
  // Cart item shape:
  // {
  //   ...product,          ← all product fields
  //   pack:   { size, mrp, price },   ← the selected pack (with correct price)
  //   option: string | null,     ← base name OR color name OR null
  //   qty:    number,
  //   _key:   string,            ← unique key: `${id}-${size}-${option}`
  // }
  //

  function addToCart(product, pack, option = null) {
    const _key = `${product.id}-${pack.size}-${option ?? 'none'}`

    setCart(prev => {
      const existing = prev.find(i => i._key === _key)
      if (existing) {
        return prev.map(i =>
          i._key === _key ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { ...product, pack, option, qty: 1, _key }]
    })
  }

  function removeFromCart(_key) {
    setCart(prev => prev.filter(i => i._key !== _key))
  }

  function updateQty(_key, qty) {
    if (qty <= 0) { removeFromCart(_key); return }
    setCart(prev =>
      prev.map(i => i._key === _key ? { ...i, qty } : i)
    )
  }

  function clearCart() { setCart([]) }

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