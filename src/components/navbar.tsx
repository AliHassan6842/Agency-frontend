import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileNav } from '@/components/mobile-nav'
import { Bot } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-4 z-50 w-full mb-6">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 px-6 bg-background/70 backdrop-blur-xl border border-border/50 rounded-full shadow-lg shadow-indigo-500/5 relative transition-all duration-300">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 font-bold text-lg tracking-tight group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <div className="w-3 h-3 bg-white rounded-sm opacity-80" />
              </div>
              <span className="hidden sm:inline-block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent group-hover:from-violet-500 group-hover:to-indigo-500 transition-all">AgencyPortal AI</span>
            </Link>
          </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Login
            </Link>
            <Link href="/register" className={buttonVariants()}>
              Get Started
            </Link>
          </div>
          <MobileNav 
            links={[
              { href: '/#features', label: 'Features' },
              { href: '/#how-it-works', label: 'How it works' },
              { href: '/#contact', label: 'Contact' },
              { href: '/login', label: 'Login' },
              { href: '/register', label: 'Get Started' }
            ]} 
          />
          </div>
        </div>
      </div>
    </header>
  )
}
