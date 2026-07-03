import { getClientProjects } from '@/app/actions/projects'
import { CreateProjectDialog } from '@/components/project/create-project-dialog'
import { ClientLiveProjectList } from '@/components/portal/client-live-project-list'

export default async function ClientProjectsPage() {
  const projects = await getClientProjects()
  const safeProjects = JSON.parse(JSON.stringify(projects))

  return (
    <div className="flex-1 space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">My Projects</h2>
          <p className="text-muted-foreground">View the status and details of your ongoing projects.</p>
        </div>
        <CreateProjectDialog />
      </div>

      <ClientLiveProjectList initialProjects={safeProjects} />
    </div>
  )
}
