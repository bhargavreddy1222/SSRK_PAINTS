import { redirect } from 'next/navigation'
import { adminSetupProblem, isAdmin } from '@/lib/adminAuth'
import LoginForm from '@/components/admin/LoginForm'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect('/admin')
  const setupProblem = adminSetupProblem()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
        <span className="grid grid-cols-2 gap-0.5 w-10 h-10 rounded-xl overflow-hidden mb-5" aria-hidden="true">
          <span className="bg-orange-600" />
          <span className="bg-amber-400" />
          <span className="bg-sky-600" />
          <span className="bg-emerald-600" />
        </span>
        <h1 className="text-xl font-extrabold">Shop Admin</h1>
        <p className="text-sm text-stone-500 mb-6">Sri Sai Ramakrishna Paints &amp; Hardware</p>

        {setupProblem ? (
          <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 leading-relaxed">
            {setupProblem} These live in <code className="font-mono text-xs">.env.local</code> (and in Vercel).
          </p>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  )
}
