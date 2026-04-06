import { useEffect, useState } from 'react'
import { Link, Outlet, useMatchRoute } from '@tanstack/react-router'
import { Diamond } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileDropdown } from '@/components/profile-dropdown'

function useCurrentTime() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

const tabs = [
  { label: 'Борлуулалт', href: '/sale' },
  { label: 'Бараа', href: '/products' },
] as const

export function PosLayout() {
  const now = useCurrentTime()
  const matchRoute = useMatchRoute()

  const dateStr = now.toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const timeStr = now.toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <div className='flex h-screen flex-col bg-[#f4f5f7]'>
      {/* ===== Top Bar ===== */}
      <header className='flex h-14 shrink-0 items-center justify-between border-b border-[#e2e5ea] bg-white px-6'>
        {/* Left: Store name */}
        <div className='flex items-center gap-2.5'>
          <Diamond className='h-5 w-5 text-[#C9A84C]' />
          <span className='text-lg font-semibold tracking-tight text-[#1a2744]'>
            Santain Diamond
          </span>
        </div>

        {/* Right: Date, time, sign out */}
        <div className='flex items-center gap-4'>
          <span className='text-sm tabular-nums text-[#5a6577]'>
            {dateStr} &middot; {timeStr}
          </span>
          <ProfileDropdown />
        </div>
      </header>

      {/* ===== Tab Navigation ===== */}
      <nav className='flex shrink-0 gap-0 border-b border-[#e2e5ea] bg-white px-6'>
        {tabs.map((tab) => {
          const isActive = !!matchRoute({ to: tab.href })
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                'relative px-5 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'text-[#C9A84C]'
                  : 'text-[#5a6577] hover:text-[#1a2744]'
              )}
            >
              {tab.label}
              {isActive && (
                <span className='absolute inset-x-0 bottom-0 h-0.5 bg-[#C9A84C]' />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ===== Content ===== */}
      <div className='flex-1 overflow-auto'>
        <Outlet />
      </div>
    </div>
  )
}
