// Shown on admin product pages when products can't be edited.
// `source` and `reason` come from getCatalogue (lib/catalog.js):
//   'unavailable' → production can't read the products table; the shop is showing its last saved pages
//   'file'        → development is showing data/products.js because the database can't be read
export default function SetupBanner({ source, reason }) {
  const missingTable = !reason || reason.includes('setup.sql')

  return (
    <div role="alert" className="border rounded-2xl p-4 text-sm mb-5 bg-amber-50 border-amber-200 text-amber-900 leading-relaxed">
      <p className="font-bold mb-1">
        {missingTable ? 'Products aren’t in the database yet' : 'Can’t load products from Supabase'}
      </p>
      <p className="m-0">
        {source === 'unavailable'
          ? <>Customers see the last saved copy of each page (or a &ldquo;call us&rdquo; message) and online orders are paused until this is fixed.{' '}</>
          : <>This is the built-in sample list from <code className="font-mono">data/products.js</code> (development only), and changes here can&apos;t be saved.{' '}</>}
        {missingTable
          ? <>Open the Supabase SQL editor, paste the contents of <code className="font-mono">supabase/setup.sql</code> and run it once — then refresh this page.</>
          : reason}
      </p>
    </div>
  )
}
