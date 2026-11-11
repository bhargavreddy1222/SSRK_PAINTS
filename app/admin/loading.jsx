// Shown while an admin page loads its data from Supabase
export default function AdminLoading() {
  return (
    <div role="status" className="min-h-screen flex items-center justify-center">
      <span className="w-9 h-9 rounded-full border-4 border-stone-300 border-t-orange-700 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
