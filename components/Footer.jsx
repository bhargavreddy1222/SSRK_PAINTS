import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 px-[5%] pt-12 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 pb-10 border-b border-white/10">

        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="text-base font-extrabold text-white">
            Sri Sai <span className="text-orange-500">Ramakrishna</span>
          </div>
          <div className="text-xs text-stone-500 font-medium mb-3">
            Paints &amp; Hardware · Guntur, AP
          </div>
          <p className="text-sm leading-relaxed text-stone-400 max-w-xs mb-4">
            Your trusted local paint and hardware shop. Genuine products at fair prices.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['Asian Paints', 'Berger Paints', 'Sheenlac', 'Saincoat', 'JK Wall Care', 'Birla Wall Care'].map(b => (
              <span key={b} className="bg-white/10 text-stone-300 px-2.5 py-0.5 rounded text-[0.68rem] font-semibold">{b}</span>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-stone-500 mb-4">Quick Links</h4>
          <ul className="space-y-2.5 list-none p-0 m-0">
            {[['/', 'Home'], ['/products', 'Products'], ['/order', 'Place Order'], ['/#contact', 'Contact']].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-stone-400 text-sm hover:text-orange-400 transition-colors no-underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-stone-500 mb-4">Contact</h4>
          <ul className="space-y-2.5 list-none p-0 m-0">
            <li>
              <a href="tel:+919949417980" className="text-stone-400 text-sm hover:text-orange-400 transition-colors no-underline">
                📞 +91 99494 17980
              </a>
            </li>
            <li>
              <a href="https://wa.me/919949417980" target="_blank" rel="noreferrer" className="text-stone-400 text-sm hover:text-orange-400 transition-colors no-underline">
                WhatsApp Us
              </a>
            </li>
            <li className="text-stone-400 text-sm leading-relaxed">
              Your Address, Guntur,<br />Andhra Pradesh
            </li>
            <li className="text-stone-400 text-sm">
              Mon–Sat: 9am – 8pm
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 text-xs text-stone-600">
        <span>© 2025 Sri Sai Ramakrishna Paints &amp; Hardware. All rights reserved.</span>
        <span>Guntur, Andhra Pradesh</span>
      </div>
    </footer>
  )
}