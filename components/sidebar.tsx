'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/overview', label: 'Overview', icon: '📊' },
  { href: '/records', label: 'Records', icon: '📋' },
  { href: '/leads', label: 'Leads', icon: '🎯' },
  { href: '/insights', label: 'Insights', icon: '📈' },
  { href: '/replies', label: 'Replies', icon: '💬' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

interface SidebarProps {
  newLeadsCount?: number
  newRecordsCount?: number
}

export function Sidebar({ newLeadsCount = 0, newRecordsCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="w-60 min-h-screen bg-[#0f1117] border-r border-[#2a2d3a] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#2a2d3a]">
        <div className="text-white font-bold text-sm tracking-wide">INTELLIGENCE ENGINE</div>
        <div className="text-slate-500 text-xs mt-0.5">UK Betting Market</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const badge = item.href === '/leads' ? newLeadsCount : item.href === '/records' ? newRecordsCount : 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#7c86ff22] text-[#7c86ff] font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1f2e]'
              )}
            >
              <span className="w-4 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span className="bg-[#f59e0b] text-black text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-[#2a2d3a] pt-3">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-[#1a1f2e] transition-colors"
        >
          <span className="w-4 text-center">↩</span>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )
}
