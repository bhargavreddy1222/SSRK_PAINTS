'use client'

import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  //
  // Cart item shape:
  // {
  //   ...product,          ← all product fields
  //   pack:   { size, price },   ← the selected pack (with correct price)
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