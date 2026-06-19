'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'

const NAV_LINKS = [
  { href: '/',         label: 'Home'     },
  { href: '/products', label: 'Products' },
  { href: '/#contact', label: 'Contact'  },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const { totalItems } = useCart()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Top bar */}
      <div className="bg-orange-700 text-white px-[5%] py-2 flex flex-wrap justify-between items-center gap-1 text-xs">
        <span className="opacity-90 flex items-center gap-1">
          📍 Your Address, Guntur, Andhra Pradesh
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <a href="tel:+919949417980" className="font-semibold hover:opacity-80 transition-opacity">
            📞 +91 99494 17980
          </a>
          <span className="opacity-40">|</span>
          <a href="https://wa.me/919949417980" target="_blank" rel="noreferrer" className="font-semibold hover:opacity-80 transition-opacity">
            WhatsApp
          </a>
          <span className="opacity-40">|</span>
          <span className="opacity-80">Mon–Sat: 9am – 8pm</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className={`bg-white border-b-2 border-stone-200 px-[5%] flex items-center justify-between h-16 sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>

        {/* Logo */}
        <Link href="/" className="flex flex-col leading-tight no-underline">
          <span className="text-[0.95rem] font-extrabold text-stone-900 tracking-tight">
            Sri Sai <span className="text-orange-700">Ramakrishna</span>
          </span>
          <span className="text-[0.62rem] text-stone-400 font-medium">
            Paints &amp; Hardware
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex gap-8 list-none m-0 p-0">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm font-medium transition-colors no-underline ${
                  pathname === link.href
                    ? 'text-orange-700 font-semibold'
                    : 'text-stone-500 hover:text-orange-700'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/order" className="relative flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors no-underline">
            🛒 Order
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-700 text-white text-[0.62rem] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <a href="tel:+919949417980" className="bg-orange-700 hover:bg-orange-800 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors no-underline">
            📞 Call Now
          </a>
        </div>

        {/* Mobile: cart icon + hamburger */}
        <div className="lg:hidden flex items-center gap-4">
          <Link href="/order" className="relative text-xl">
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-700 text-white text-[0.6rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileOpen(true)} className="flex flex-col gap-[5px] p-1 bg-transparent border-0 cursor-pointer" aria-label="Open menu">
            <span className="block w-6 h-0.5 bg-stone-900 rounded" />
            <span className="block w-6 h-0.5 bg-stone-900 rounded" />
            <span className="block w-6 h-0.5 bg-stone-900 rounded" />
          </button>
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col items-start px-[5%] py-8">
          <button onClick={() => setMobileOpen(false)} className="self-end text-2xl cursor-pointer bg-transparent border-0 text-stone-900 mb-8">
            ✕
          </button>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-xl font-bold text-stone-900 py-3 border-b border-stone-200 w-full no-underline hover:text-orange-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/order" onClick={() => setMobileOpen(false)} className="text-xl font-bold text-stone-900 py-3 border-b border-stone-200 w-full no-underline hover:text-orange-700 transition-colors">
            🛒 Order ({totalItems})
          </Link>
          <a href="tel:+919949417980" className="mt-8 bg-orange-700 text-white py-4 rounded-xl font-bold text-base text-center w-full no-underline">
            📞 Call Now
          </a>
        </div>
      )}
    </>
  )
}