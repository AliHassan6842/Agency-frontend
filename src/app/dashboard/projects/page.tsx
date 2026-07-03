import { getProjects } from '@/app/actions/projects'
import { getClients } from '@/app/actions/clients'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AddProjectDialog } from './add-project-dialog'
import { LiveProjectList } from '@/components/dashboard/live-project-list'

export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([
    getProjects(),
    getClients()
  ])

  // Need to cast to any to pass the Date strings smoothly to client component
  const safeProjects = JSON.parse(JSON.stringify(projects))
  const safeClients = JSON.parse(JSON.stringify(clients))

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent pb-1">
            Projects
          </h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Manage your agency's active workspaces.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-9 bg-background w-full"
            />
          </div>
          <AddProjectDialog clients={safeClients} />
        </div>
      </div>

      <LiveProjectList initialProjects={safeProjects} clients={safeClients} />
    </div>
  )
}
