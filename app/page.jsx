import Link from 'next/link'

const BRANDS = [
  { id: 'AP', name: 'Asian Paints',   bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', badge: 'Top Brand', desc: "India's #1 paint brand. Full range of interior, exterior, and texture products." },
  { id: 'BP', name: 'Berger Paints',  bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   badge: 'Top Brand', desc: 'Silk, Weathercoat, Easy Clean — reliable paints for every surface.' },
  { id: 'SL', name: 'Sheenlac',       bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', badge: null, desc: 'NC lacquers and PU finishes for wood, furniture, and doors.' },
  { id: 'SC', name: 'Saincoat',       bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',   badge: null, desc: 'Interior and exterior emulsions at reasonable prices.' },
  { id: 'JK', name: 'JK Wall Care',   bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100',  badge: null, desc: 'JK Cement wall care putty for a smooth, strong base coat.' },
  { id: 'BW', name: 'Birla Wall Care',bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', badge: null, desc: 'Birla White wall care putty — high whiteness, smooth finish.' },
]

const PRODUCTS = [
  { icon: '🖌️', name: 'Interior Wall Paints',     desc: 'Emulsions and distempers in matte and silky finishes.' },
  { icon: '🏚️', name: 'Exterior Paints',           desc: 'Weatherproof coatings for rain, sun, and humidity.' },
  { icon: '🪵', name: 'Wood Polish & Finishes',    desc: 'NC lacquer, PU polish, and wood stains for all wooden surfaces.' },
  { icon: '🧱', name: 'Wall Putty & Wall Care',    desc: 'JK and Birla putty for smooth wall preparation.' },
  { icon: '🎨', name: 'Primers & Undercoats',      desc: 'Wall primers for proper paint adhesion.' },
  { icon: '🔧', name: 'Hardware & Accessories',    desc: 'Brushes, rollers, masking tape, thinner, and more.' },
]

export default function HomePage() {
  return (
    <>
      {/* ── HERO ───────────────────────────────── */}
      <section className="bg-white border-b border-stone-200 relative overflow-hidden px-[5%] py-16">
        {/* Diagonal bg */}
        <div
          className="absolute right-0 top-0 w-[38%] h-full bg-orange-50 pointer-events-none"
          style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}
        />

        <div className="max-w-xl relative z-10">
          <span className="inline-block bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded text-[0.7rem] font-bold tracking-wide uppercase mb-5">
            Paints &amp; Hardware · Guntur, AP
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.12] tracking-tight mb-2">
            Sri Sai<br />
            <span className="text-orange-700">Ramakrishna</span><br />
            Paints &amp; Hardware
          </h1>

          <p className="text-sm text-stone-500 mt-3 mb-7 max-w-md leading-relaxed">
            Your trusted local shop for paints, putty, wood polish, and all hardware needs in Guntur.
          </p>

          {/* Brand chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['Asian Paints', 'Berger Paints', 'Sheenlac', 'Saincoat', 'JK Wall Care', 'Birla Wall Care', 'Wood Polish'].map(b => (
              <span key={b} className="bg-stone-100 border border-stone-200 text-stone-800 px-3 py-1 rounded text-[0.72rem] font-semibold">{b}</span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="bg-stone-900 hover:bg-stone-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
              Browse Products →
            </Link>
            <a href="tel:+919949417980" className="bg-orange-700 hover:bg-orange-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
              📞 Call Us
            </a>
            <a href="https://wa.me/919949417980" target="_blank" rel="noreferrer" className="bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors no-underline flex items-center gap-2">
              WhatsApp
            </a>
          </div>

          <div className="flex items-start gap-2 mt-8 text-sm text-stone-400">
            <span className="mt-0.5 flex-shrink-0">📍</span>
            <span>Your Address, Landmark, Guntur, Andhra Pradesh — PIN XXXXXX</span>
          </div>
        </div>
      </section>

      {/* ── PAINT BAR ──────────────────────────── */}
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#C2410C 0% 20%,#D97706 20% 40%,#16A34A 40% 60%,#2563EB 60% 80%,#7C3AED 80% 100%)' }} />

      {/* ── WHAT WE SELL ───────────────────────── */}
      <section className="bg-stone-100 px-[5%] py-16">
        <p className="text-orange-700 text-[0.7rem] font-bold uppercase tracking-widest mb-1">What We Sell</p>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-8">
          Paints, putty &amp; hardware — all under one roof
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map(p => (
            <div key={p.name} className="bg-white border border-stone-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-md transition-all duration-200">
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-bold text-base mb-1.5">{p.name}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/products" className="inline-block bg-orange-700 hover:bg-orange-800 text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
            View Full Catalogue →
          </Link>
        </div>
      </section>

      {/* ── BRANDS ─────────────────────────────── */}
      <section className="bg-white px-[5%] py-16">
        <p className="text-orange-700 text-[0.7rem] font-bold uppercase tracking-widest mb-1">Brands We Stock</p>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-8">
          Products from brands you can trust
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {BRANDS.map(b => (
            <div
              key={b.id}
              className={`flex items-start gap-4 bg-white rounded-xl p-5 transition-all duration-200 border-2 ${b.border} hover:shadow-md`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${b.bg} ${b.text}`}>
                {b.id}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base">{b.name}</h3>
                  {b.badge && (
                    <span className={`text-[0.62rem] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${b.bg} ${b.text}`}>
                      {b.badge}
                    </span>
                  )}
                </div>
                <p className="text-stone-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────── */}
      <section id="contact" className="bg-stone-100 px-[5%] py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-orange-700 text-[0.7rem] font-bold uppercase tracking-widest mb-2">Find Us</p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Come visit or give us a call</h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Open 6 days a week. For bulk orders, call ahead and we'll have everything ready for you.
            </p>
            <div className="flex flex-col gap-4 mb-6">
              {[
                { icon: '📍', label: 'Address',    val: 'Your Address, Landmark,\nGuntur, Andhra Pradesh — PIN XXXXXX' },
                { icon: '📞', label: 'Phone',      val: '+91 XXXXX XXXXX' },
                { icon: '🕐', label: 'Shop Hours', val: 'Mon–Sat: 9am–8pm  ·  Sun: 10am–5pm' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 text-sm">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-base flex-shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <div className="text-[0.7rem] font-bold text-stone-400 uppercase tracking-wider mb-0.5">{item.label}</div>
                    <div className="text-stone-800 whitespace-pre-line">{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="tel:+919949417980" className="flex items-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors no-underline">📞 Call Now</a>
              <a href="https://wa.me/9949417980" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors no-underline">WhatsApp</a>
            </div>
          </div>
          {/* Map placeholder */}
          <div className="rounded-xl border border-stone-200 bg-stone-200 h-64 flex flex-col items-center justify-center gap-2 text-sm text-stone-500">
            <span className="text-3xl">🗺️</span>
            <span>Paste Google Maps iframe here</span>
            <a href="https://share.google/SV44unc6GWj0dw246" target="_blank" rel="noreferrer" className="text-orange-700 font-bold text-xs hover:underline">
              Open in Google Maps →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}