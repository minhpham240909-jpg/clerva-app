'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/dashboard', label: 'Leads' },
    { href: '/dashboard/settings', label: 'Settings' },
    { href: '/dashboard/billing', label: 'Billing' },
  ]

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-gray-900">
            Adecis
          </Link>
          <div className="flex items-center gap-6 text-sm">
            {navItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-500 hover:text-gray-900'
                  }
                >
                  {item.label}
                </Link>
              )
            })}
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
