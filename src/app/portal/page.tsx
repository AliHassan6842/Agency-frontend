import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Ticket, CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ClientPortalOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch their profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Fetch projects assigned to them
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  // Fetch tickets they created or are assigned to them
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  const activeProjects = projects?.filter(p => p.status !== 'completed') || []
  const openTickets = tickets?.filter(t => t.status === 'open') || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent pb-1">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Client'}!
          </h2>
          <p className="text-muted-foreground mt-1">Here is a summary of your active services and requests.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" render={<Link href="/portal/projects" />}>
            View Projects
          </Button>
          <Button render={<Link href="/portal/tickets/new" />}>
            Submit Ticket
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/30">
          <div className="absolute -right-6 -top-6 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors duration-500">
            <FileText className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-semibold text-muted-foreground uppercase">Active Projects</h3>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex flex-col">
            <div className="text-4xl font-black text-foreground">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-green-500/30">
          <div className="absolute -right-6 -top-6 text-green-500/10 group-hover:text-green-500/20 transition-colors duration-500">
            <CheckCircle2 className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-semibold text-muted-foreground uppercase">Completed</h3>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex flex-col">
            <div className="text-4xl font-black text-foreground">{(projects?.length || 0) - activeProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-rose-500/30">
          <div className="absolute -right-6 -top-6 text-rose-500/10 group-hover:text-rose-500/20 transition-colors duration-500">
            <Ticket className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-semibold text-muted-foreground uppercase">Open Tickets</h3>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex flex-col">
            <div className="text-4xl font-black text-foreground">{openTickets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting resolution</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30">
          <div className="absolute -right-6 -top-6 text-blue-500/10 group-hover:text-blue-500/20 transition-colors duration-500">
            <Clock className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-semibold text-muted-foreground uppercase">Total Tickets</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex flex-col">
            <div className="text-4xl font-black text-foreground">{tickets?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime support requests</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card/50 backdrop-blur-xl shadow-sm h-full flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Recent Projects
            </h3>
            <Link href="/portal/projects" className="text-sm font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-2 flex-1">
            {projects && projects.length > 0 ? (
              <div className="space-y-1">
                {projects.slice(0, 4).map((project) => (
                  <Link href={`/portal/projects/${project.id}`} key={project.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/50 transition-colors group">
                    <div className="space-y-1">
                      <p className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{project.name}</p>
                      <p className="text-xs text-muted-foreground">Status: <span className="capitalize">{project.status}</span></p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p>No projects assigned to you yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 backdrop-blur-xl shadow-sm h-full flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Ticket className="w-4 h-4 text-rose-500" />
              Recent Support Tickets
            </h3>
            <Link href="/portal/tickets" className="text-sm font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-2 flex-1">
            {tickets && tickets.length > 0 ? (
              <div className="space-y-1">
                {tickets.slice(0, 4).map((ticket) => (
                  <Link href={`/portal/tickets/${ticket.id}`} key={ticket.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/50 transition-colors group">
                    <div className="space-y-1">
                      <p className="font-medium group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">Priority: <span className="capitalize">{ticket.priority}</span> • Status: <span className="capitalize">{ticket.status}</span></p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-rose-500 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <Ticket className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p>You haven't opened any support tickets.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
