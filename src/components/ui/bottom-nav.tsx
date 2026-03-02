'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/profile',
    label: 'PROFILE',
    icon: (active: boolean) => (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill={active ? '#F0D078' : '#706B56'}>
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    ),
  },
  {
    href: '/clips',
    label: 'CLIPS',
    icon: (active: boolean) => (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill={active ? '#F0D078' : '#706B56'}>
        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
      </svg>
    ),
  },
  {
    href: '/tags',
    label: 'SKILLS',
    icon: (active: boolean) => (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill={active ? '#F0D078' : '#706B56'}>
        <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
      </svg>
    ),
  },
  {
    href: '/team',
    label: 'TEAM',
    icon: (active: boolean) => (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill={active ? '#F0D078' : '#706B56'}>
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[430px] z-50 flex justify-around items-center px-1 py-2 border-t border-border bg-bg/95 backdrop-blur-xl" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-4 min-h-[44px] justify-center rounded-xl min-w-[60px] no-underline transition-all ${
              active ? 'bg-accent-dim' : 'bg-transparent'
            }`}
          >
            {tab.icon(active)}
            <span
              className={`text-[9px] font-bold tracking-wide uppercase font-sans ${
                active ? 'text-accent-light' : 'text-text-dim'
              }`}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
