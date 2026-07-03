import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Home } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getNotifications } from "@/app/actions/notifications"
import { NotificationBell } from "@/components/layout/notification-bell"
import { DesktopNav } from "@/components/layout/desktop-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // RBAC Guard: Verify if user is an Admin by checking the profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'

  if (!isStaff) {
    // If not staff, force redirect to client portal
    redirect('/portal/projects')
  }

  // Force Admin to purchase a plan
  const { data: workspaceUser } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  let workspacePlan = null;
  if (workspaceUser) {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('plan')
      .eq('id', workspaceUser.workspace_id)
      .single()
      
    workspacePlan = workspace?.plan;
    if (workspacePlan === 'free') {
      redirect('/onboarding/billing')
    }
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
              <span className="hidden sm:inline-block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">AgencyPortal</span>
            </div>
            
            {/* Center: Desktop Navigation */}
            <DesktopNav 
              links={[
                { href: '/dashboard', label: 'Overview' },
                { href: '/dashboard/clients', label: 'Clients' },
                { href: '/dashboard/projects', label: 'Projects' },
                { href: '/dashboard/tasks', label: 'Tasks' },
                { href: '/dashboard/files', label: 'Files' },
                { href: '/dashboard/tickets', label: 'Tickets' },
                { href: '/dashboard/history', label: 'History' }
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
                { href: '/dashboard', label: 'Overview' },
                { href: '/dashboard/clients', label: 'Clients' },
                { href: '/dashboard/projects', label: 'Projects' },
                { href: '/dashboard/tasks', label: 'Tasks' },
                { href: '/dashboard/tickets', label: 'Tickets' },
                { href: '/dashboard/history', label: 'History' },
                { href: '/dashboard/settings/billing', label: 'Billing' }
              ]} 
            />

            <div className="hidden sm:flex items-center gap-2 border-l pl-4 ml-2">
              {workspacePlan && workspacePlan !== 'free' && (
                <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-md mr-2">
                  {workspacePlan}
                </span>
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">Admin</span>
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
