import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { LogoutButton } from "@/components/logout-button"
import Link from "next/link"
import { Home } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getNotifications } from "@/app/actions/notifications"
import { NotificationBell } from "@/components/layout/notification-bell"
import { DesktopNav } from "@/components/layout/desktop-nav"

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // RBAC Guard: Verify if user is a Client by checking profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isClient = profile?.role === 'client'

  if (!isClient) {
    // If not a client (e.g. admin or staff), force redirect to staff dashboard
    redirect('/dashboard')
  }

  // Get notifications
  const notifications = await getNotifications()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navbar */}
      <header className="sticky top-4 z-50 w-full mb-6">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 px-6 bg-background/70 backdrop-blur-xl border border-border/50 rounded-full shadow-lg shadow-indigo-500/5 relative transition-all duration-300">
            
            {/* Left: Logo */}
            <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-inner">
                <div className="w-3 h-3 bg-white rounded-sm opacity-80" />
              </div>
              <span className="hidden sm:inline-block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Client Portal</span>
            </div>
            
            {/* Center: Desktop Navigation */}
            <DesktopNav 
              links={[
                { href: '/portal', label: 'Overview' },
                { href: '/portal/projects', label: 'Projects' },
                { href: '/portal/files', label: 'Files' },
                { href: '/portal/tickets', label: 'Tickets' },
                { href: '/portal/invoices', label: 'Invoices' },
                { href: '/portal/chat', label: 'AI Assistant', isSpecial: true }
              ]} 
            />

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell initialNotifications={notifications} />
            <ThemeToggle />
            
            <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-muted-foreground hover:text-foreground")}>
              <Home className="h-5 w-5" />
            </Link>

            <MobileNav 
              links={[
                { href: '/portal', label: 'Overview' },
                { href: '/portal/projects', label: 'My Projects' },
                { href: '/portal/tickets', label: 'Support Tickets' }
              ]} 
            />

            <div className="hidden sm:flex items-center gap-2 border-l pl-4 ml-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">Client</span>
              <LogoutButton />
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col container mx-auto px-4 md:px-8 py-6">
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
