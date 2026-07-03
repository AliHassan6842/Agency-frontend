'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface NavLink {
  href: string
  label: string
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Toggle Menu">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {open && (
        <div className="absolute top-16 left-0 w-full bg-background border-b shadow-lg z-50 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/50 last:border-0"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
