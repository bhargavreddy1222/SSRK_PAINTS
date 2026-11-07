// Shown on admin product pages while the shop is still reading data/products.js.
// `reason` comes from describeSupabaseError (lib/supabaseAdmin.js).
export default function SetupBanner({ reason }) {
  const missingTable = !reason || reason.includes('setup.sql')

  return (
    <div className="border rounded-2xl p-4 text-sm mb-5 bg-amber-50 border-amber-200 text-amber-900 leading-relaxed">
      <p className="font-bold mb-1">
        {missingTable ? 'Products aren\u2019t in the database yet' : 'Can\u2019t load products from Supabase'}
      </p>
      <p className="m-0">
        The shop is showing the built-in list from <code className="font-mono">data/products.js</code>, and changes here
        can&apos;t be saved.{' '}
        {missingTable
          ? <>Open the Supabase SQL editor, paste the contents of <code className="font-mono">supabase/setup.sql</code> and run it once — then refresh this page.</>
          : reason}
      </p>
    </div>
  )
}
