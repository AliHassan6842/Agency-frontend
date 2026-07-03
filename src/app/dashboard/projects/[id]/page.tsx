import { getProjectById } from '@/app/actions/projects'
import { getTasks } from '@/app/actions/tasks'
import { getFiles } from '@/app/actions/files'
import { getProjectMessages } from '@/app/actions/messages'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FolderGit2, Calendar, ArrowLeft, LayoutGrid, FileText, Settings, MessageSquare, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { AddTaskDialog } from '@/components/kanban/add-task-dialog'
import { FileUploader } from '@/components/files/file-uploader'
import { FileList } from '@/components/files/file-list'
import { ProjectChat } from '@/components/project/project-chat'
import { ProjectAISummary } from '@/components/project/project-ai-summary'
import { GenerateMilestonesButton } from '@/components/project/generate-milestones-button'
import { ProjectSettingsDialog } from '@/components/project/project-settings-dialog'
import { EditableMilestones } from '@/components/project/editable-milestones'

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const [project, tasks, files, initialMessages, { data: milestones }] = await Promise.all([
    getProjectById(params.id),
    getTasks(params.id),
    getFiles(params.id),
    getProjectMessages(params.id),
    supabase.from('milestones').select('*').eq('project_id', params.id).order('due_date', { ascending: true })
  ])

  if (!project) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-8 h-full flex flex-col">
      {/* Back Button */}
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/dashboard/projects" />} className="mb-2 -ml-3 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>

      {/* Project Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="capitalize mt-1">
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {project.client ? (
              <span className="font-medium text-foreground">
                {project.client.company || project.client.name}
              </span>
            ) : (
              <span className="italic">Internal Project</span>
            )}
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          {project.description && (
            <p className="max-w-3xl text-muted-foreground mt-4">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <AddTaskDialog projectId={project.id} />
          <ProjectSettingsDialog project={project} />
        </div>
      </div>

      {/* Tabs Layer */}
      <Tabs defaultValue="messages" className="w-full flex-1 flex flex-col">
        <TabsList className="w-full sm:w-auto flex overflow-x-auto justify-start border-b rounded-none h-12 bg-transparent p-0 mb-6 shrink-0">
          <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-6">Overview</TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-6">Tasks Board</TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-6">Files</TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-6">Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 flex-1 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <ProjectAISummary projectId={project.id} initialSummary={project.ai_summary} />
              
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Project Milestones
                  </h3>
                  <GenerateMilestonesButton projectId={project.id} />
                </div>
                
                <EditableMilestones initialMilestones={milestones || []} projectId={project.id} />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Project Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <span className="capitalize font-medium">{project.status}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Total Tasks</span>
                    <span className="font-medium">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Total Files</span>
                    <span className="font-medium">{files.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="flex-1 outline-none min-h-[500px]">
          <KanbanBoard initialTasks={tasks} />
        </TabsContent>
        
        <TabsContent value="files" className="flex-1 outline-none space-y-6">
          <FileUploader projectId={project.id} clientId={project.client_id} workspaceId={project.workspace_id} />
          <FileList files={files} />
        </TabsContent>

        <TabsContent value="messages" className="flex-1 outline-none max-w-4xl mx-auto w-full">
          <ProjectChat 
            projectId={project.id} 
            initialMessages={initialMessages} 
            currentUserId={user.id} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
