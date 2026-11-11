'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { PRODUCT_TYPE } from '@/lib/products'
import { CheckIcon, PlusIcon } from '@/components/Icons'

// The "choose and add" part of a product, shared by the catalogue card
// and the product page.

const rupees = n => `₹${n.toLocaleString('en-IN')}`

// Light swatches need a border to stay visible on white
function isLight(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return false
  const n = parseInt(hex.slice(1), 16)
  const luminance = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return luminance > 0.8
}

// What the customer has picked for one product: base (tintable), colour (ready-mix) and pack
export function useProductChoice(product) {
  const tintable = product.type === PRODUCT_TYPE.TINTABLE
  const readymix = product.type === PRODUCT_TYPE.READYMIX

  const [base,  setBase]  = useState(tintable ? product.bases[0] : null)
  const [pack,  setPack]  = useState(tintable ? product.bases[0].packs[0] : product.packs[0])
  const [color, setColor] = useState(readymix ? product.colors[0] : null)

  // Keep the same size when the base changes, if the new base has it
  function chooseBase(next) {
    setBase(next)
    setPack(next.packs.find(p => p.size === pack?.size) ?? next.packs[0])
  }

  const hasDiscount = pack?.mrp > pack?.price
  return {
    base, pack, color,
    chooseBase, choosePack: setPack, chooseColor: setColor,
    packs: tintable ? base.packs : product.packs,
    // Saved with the order line: the base name or the colour name
    option: tintable ? base.name : readymix ? color.name : null,
    hasDiscount,
    discountPercent: hasDiscount ? Math.round(((pack.mrp - pack.price) / pack.mrp) * 100) : 0,
  }
}

export function ProductChoices({ product, choice }) {
  return (
    <>
      {/* ── TINTABLE: Base selector ───────────────────── */}
      {product.type === PRODUCT_TYPE.TINTABLE && (
        <OptionGroup label="Base">
          <div className="flex flex-wrap gap-1.5">
            {product.bases.map(base => (
              <Chip
                key={base.id ?? base.name}
                active={choice.base.name === base.name}
                onClick={() => choice.chooseBase(base)}
                title={base.desc}
              >
                {base.name}
              </Chip>
            ))}
          </div>
          {choice.base.desc && (
            <p className="text-xs text-stone-600 mt-1.5">{choice.base.desc}</p>
          )}
        </OptionGroup>
      )}

      {/* ── READYMIX: Color selector ──────────────────── */}
      {product.type === PRODUCT_TYPE.READYMIX && (
        <OptionGroup label="Colour" value={choice.color.name}>
          <div className="flex flex-wrap gap-2">
            {product.colors.map(color => {
              const active = choice.color.name === color.name
              return (
                <button
                  key={color.id ?? color.name}
                  type="button"
                  onClick={() => choice.chooseColor(color)}
                  title={color.name}
                  aria-label={color.name}
                  aria-pressed={active}
                  className={`w-7 h-7 coarse:w-11 coarse:h-11 rounded-full transition-all cursor-pointer shrink-0 ring-offset-2 ${
                    active ? 'ring-2 ring-stone-900' : 'hover:scale-110'
                  } ${isLight(color.hex) ? 'border border-stone-300' : 'border-0'}`}
                  style={{ backgroundColor: color.hex }}
                />
              )
            })}
          </div>
        </OptionGroup>
      )}

      {/* ── Pack size selector (updates per base) ─────── */}
      <OptionGroup label="Pack Size">
        <div className="flex flex-wrap gap-1.5">
          {choice.packs.map(pack => (
            <Chip
              key={pack.size}
              active={choice.pack?.size === pack.size}
              onClick={() => choice.choosePack(pack)}
            >
              {pack.size}
            </Chip>
          ))}
        </div>
      </OptionGroup>
    </>
  )
}

// Live price for the current choice + the Add button
export function PriceAndAdd({ product, choice, large = false }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  const { pack, color, hasDiscount } = choice

  // Reset the "Added" confirmation after a moment
  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 1500)
    return () => clearTimeout(timer)
  }, [added])

  function handleAdd() {
    // The pack object already carries the right price for the chosen base
    addToCart(product, pack, choice.option)
    setAdded(true)
  }

  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className={`text-stone-900 font-extrabold ${large ? 'text-3xl' : 'text-xl'}`}>{rupees(pack.price)}</span>
          {hasDiscount && (
            <span className="text-stone-500 text-sm">
              <span className="sr-only">MRP </span>
              <span className="line-through">{rupees(pack.mrp)}</span>
            </span>
          )}
        </div>
        <p className="text-stone-500 text-xs truncate">
          per {pack.size}{color ? ` · ${color.name}` : ''}
        </p>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Add ${product.name}, ${pack.size}, to your order`}
        className={`flex items-center gap-1.5 shrink-0 coarse:min-h-11 rounded-xl font-bold text-sm transition-colors cursor-pointer border-0 ${
          large ? 'px-6 py-3.5' : 'px-4 py-2.5'
        } ${added ? 'bg-green-700 text-white' : 'bg-orange-700 hover:bg-orange-800 text-white'}`}
      >
        {added
          ? <><CheckIcon className="w-4 h-4" /> Added</>
          : <><PlusIcon className="w-4 h-4" /> {large ? 'Add to order' : 'Add'}</>}
      </button>
      {/* Tells screen-reader users the tap worked */}
      <span role="status" className="sr-only">{added ? `${product.name} added to your order` : ''}</span>
    </div>
  )
}

function OptionGroup({ label, value, children }) {
  return (
    <div>
      <p className="text-[0.65rem] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
        {label}
        {value && <span className="ml-1.5 normal-case tracking-normal font-semibold text-stone-700">· {value}</span>}
      </p>
      {children}
    </div>
  )
}

function Chip({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`text-xs font-semibold px-3 py-1.5 coarse:min-h-11 coarse:min-w-11 rounded-lg border transition-colors cursor-pointer ${
        active
          ? 'bg-stone-900 text-white border-stone-900'
          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}
