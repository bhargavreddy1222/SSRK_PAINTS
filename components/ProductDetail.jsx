'use client'

import Image from 'next/image'
import Link from 'next/link'
import { brandStyle } from '@/lib/brands'
import { ArrowRightIcon, PaletteIcon } from '@/components/Icons'
import { PriceAndAdd, ProductChoices, useProductChoice } from '@/components/ProductBuy'

// The product's own page (/products/12-name)
export default function ProductDetail({ product }) {
  const choice = useProductChoice(product)
  const style = brandStyle(product.brand)

  return (
    <div className="min-h-[70vh] bg-stone-50 px-[5%] py-8 md:py-12">
      <div className="max-w-5xl mx-auto">

        <nav aria-label="Breadcrumb" className="text-sm text-stone-600 mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 list-none m-0 p-0">
            <li><Link href="/products" className="coarse:py-3 inline-block text-orange-700 font-semibold no-underline hover:underline">Products</Link></li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/products?brand=${encodeURIComponent(product.brand)}`} className="coarse:py-3 inline-block text-orange-700 font-semibold no-underline hover:underline">
                {product.brand}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-stone-600 truncate">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 bg-white border border-stone-200 rounded-3xl p-5 md:p-8">
          <div className="relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100 border border-stone-100">
            {product.image ? (
              <Image
                src={product.image}
                alt={`${product.brand} ${product.name}`}
                fill
                preload
                sizes="(min-width: 768px) 440px, 90vw"
                className="object-contain p-6"
              />
            ) : (
              <div className={`absolute inset-0 flex items-center justify-center ${style.text} opacity-40`}>
                <PaletteIcon className="w-20 h-20" />
              </div>
            )}
            {choice.hasDiscount && (
              <span className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full bg-green-700 text-white">
                {choice.discountPercent}% off
              </span>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <p className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>{product.brand}</span>
                <span className="text-xs text-stone-600 font-semibold uppercase tracking-wider">{product.category}</span>
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">{product.name}</h1>
              {product.description && (
                <p className="text-stone-600 text-sm md:text-base leading-relaxed mt-3">{product.description}</p>
              )}
            </div>

            <ProductChoices product={product} choice={choice} />

            <div className="mt-auto pt-5 border-t border-stone-100">
              <PriceAndAdd product={product} choice={choice} large />
              <p className="text-stone-600 text-xs leading-relaxed mt-3">
                No payment online. We confirm the final price and stock by phone or WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <Link href="/products" className="inline-flex items-center gap-1.5 coarse:min-h-11 mt-6 text-orange-700 hover:text-orange-800 text-sm font-bold no-underline">
          See all products <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
