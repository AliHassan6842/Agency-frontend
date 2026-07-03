import { createClient } from '@/lib/supabase/server'
import { CopyButton } from '@/components/ui/copy-button'
import { Users, FolderGit2, TicketCheck, ArrowRight, Activity, Sparkles, Building2 } from 'lucide-react'
import Link from 'next/link'
import { verifySessionAction } from '@/app/actions/billing'

export default async function DashboardOverview(props: { searchParams: Promise<{ success?: string, session_id?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  // Attempt to securely verify the Stripe Checkout Session if returning from checkout
  let newlyUpgradedPlan = null;
  if (searchParams.success === 'true' && searchParams.session_id && !searchParams.session_id.includes('mock_session')) {
    try {
      newlyUpgradedPlan = await verifySessionAction(searchParams.session_id);
    } catch (e) {
      console.error('Failed to verify session', e);
    }
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  // Get the workspace owned by the current user
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id, name, plan')
    .eq('owner_id', user?.id)

  const myWorkspace = workspaces?.[0]
  const inviteUrl = myWorkspace 
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?invite=${myWorkspace.id}` 
    : ''

  // Fetch actual metrics
  const [
    { count: clientsCount },
    { count: projectsCount },
    { count: openTicketsCount },
    { data: recentProjects }
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('workspace_id', myWorkspace?.id),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('workspace_id', myWorkspace?.id),
    supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open').in('project_id', 
      (await supabase.from('projects').select('id').eq('workspace_id', myWorkspace?.id)).data?.map(p => p.id) || []
    ),
    supabase.from('projects').select('id, name, status, created_at, client:clients(name)').eq('workspace_id', myWorkspace?.id).order('created_at', { ascending: false }).limit(4)
  ])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {(searchParams.success === 'true' && (!searchParams.session_id || searchParams.session_id.includes('mock_session') || newlyUpgradedPlan)) && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 border border-indigo-500/20 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 relative z-10">
              <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-foreground">Payment Successful!</h3>
              <p className="text-muted-foreground mt-1">
                Your workspace has been successfully upgraded to the <span className="font-bold text-foreground capitalize">{newlyUpgradedPlan || myWorkspace?.plan || 'Premium'}</span> plan. All features are now fully unlocked.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent drop-shadow-sm">
            Overview
          </h2>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            Welcome back to your agency command center.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Metric Cards */}
        <div className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/30">
          <div className="absolute -right-6 -top-6 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors duration-500">
            <Users className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-semibold text-muted-foreground uppercase">Active Clients</h3>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-baseline gap-2">
            <div className="text-4xl font-black text-foreground">{clientsCount || 0}</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-purple-500/30">
          <div className="absolute -right-6 -top-6 text-purple-500/10 group-hover:text-purple-500/20 transition-colors duration-500">
            <FolderGit2 className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-semibold text-muted-foreground uppercase">Total Projects</h3>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-baseline gap-2">
            <div className="text-4xl font-black text-foreground">{projectsCount || 0}</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-rose-500/30">
          <div className="absolute -right-6 -top-6 text-rose-500/10 group-hover:text-rose-500/20 transition-colors duration-500">
            <TicketCheck className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-semibold text-muted-foreground uppercase">Open Tickets</h3>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
              <TicketCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-baseline gap-2">
            <div className="text-4xl font-black text-foreground">{openTicketsCount || 0}</div>
            <span className="text-sm font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">Requires action</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-7 space-y-6">
          {/* Invite Link Panel */}
          {myWorkspace && (
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-950 to-slate-900 text-white shadow-xl p-8">
              <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  Agency Invite Link
                </h3>
                <p className="text-indigo-200/80 mb-6 max-w-md">
                  Onboard clients instantly. Share this secure portal link to allow them to register and sync directly to your agency workspace.
                </p>
                <div className="flex items-center gap-3 bg-black/40 p-1.5 pl-4 rounded-xl border border-indigo-500/30 backdrop-blur-md">
                  <code className="text-sm font-mono flex-1 overflow-x-auto whitespace-nowrap text-indigo-300">
                    {inviteUrl}
                  </code>
                  <CopyButton text={inviteUrl} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-5">
          {/* Recent Activity / Projects */}
          <div className="rounded-2xl border bg-card/50 backdrop-blur-xl shadow-sm h-full flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Recent Projects
              </h3>
              <Link href="/dashboard/projects" className="text-sm font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-2 flex-1">
              {recentProjects && recentProjects.length > 0 ? (
                <div className="space-y-1">
                  {recentProjects.map((project: any) => (
                    <Link 
                      key={project.id} 
                      href={`/dashboard/projects/${project.id}`}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/50 transition-colors group"
                    >
                      <div>
                        <p className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {project.client?.name || 'Internal'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-muted rounded-md text-muted-foreground">
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                  <FolderGit2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p>No projects yet.</p>
                  <p className="text-sm mt-1">Create a project to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
