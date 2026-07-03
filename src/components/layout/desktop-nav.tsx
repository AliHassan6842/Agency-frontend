'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
  isSpecial?: boolean
}

export function DesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 p-1 bg-muted/40 rounded-full border shadow-sm">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/dashboard' && link.href !== '/portal' && pathname.startsWith(link.href))
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
              link.isSpecial && "text-indigo-500 font-semibold"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
