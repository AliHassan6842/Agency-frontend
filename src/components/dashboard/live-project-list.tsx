'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProjectStore, Project } from '@/store/projects'
import { FolderGit2, LayoutGrid, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { acceptProjectAction } from '@/app/actions/projects'
import { AddProjectDialog } from '@/app/dashboard/projects/add-project-dialog'

export function LiveProjectList({ initialProjects, clients }: { initialProjects: Project[], clients: any[] }) {
  const { projects, setProjects, addProject, updateProject, removeProject } = useProjectStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      setProjects(initialProjects)
      setIsInitialized(true)
    }
  }, [initialProjects, isInitialized, setProjects])

  useEffect(() => {
    const supabase = createClient()
    let channel: any;

    async function setupRealtime() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel(`workspace-projects-${Math.random()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'projects' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              // Note: payload.new won't have the joined `client` object, but it will appear in the UI
              // To get the full client name, we'd need to fetch it, but for instant UI we just insert it
              addProject(payload.new as Project)
            } else if (payload.eventType === 'UPDATE') {
              updateProject(payload.new.id, payload.new as Partial<Project>)
            } else if (payload.eventType === 'DELETE') {
              removeProject(payload.old.id)
            }
          }
        )
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [addProject, updateProject, removeProject])

  const handleAccept = async (id: string) => {
    // Optimistic UI update via Zustand
    updateProject(id, { status: 'planning' })
    // Server action to update DB
    await acceptProjectAction(id)
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-12 text-center flex flex-col items-center justify-center border-dashed">
        <FolderGit2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg">No projects yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-4">
          Create your first project to start tracking milestones and collaborating with your team.
        </p>
        <AddProjectDialog clients={clients} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((project) => {
        const isPending = project.status === 'pending_approval'

        return (
          <div key={project.id} className="group flex flex-col rounded-2xl border bg-card/50 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/30 relative overflow-hidden">
            <Link 
              href={`/dashboard/projects/${project.id}`} 
              className="flex-1 p-6"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                {isPending ? <Clock className="w-32 h-32 text-orange-500 -translate-y-8 translate-x-8" /> : <FolderGit2 className="w-32 h-32 text-indigo-500 -translate-y-8 translate-x-8" />}
              </div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <Badge variant={isPending ? 'destructive' : project.status === 'active' ? 'default' : 'secondary'} className="capitalize shadow-sm">
                  {project.status.replace('_', ' ')}
                </Badge>
                <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${isPending ? 'bg-orange-500/10 text-orange-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                  {isPending ? <Clock className="h-4 w-4" /> : <FolderGit2 className="h-4 w-4" />}
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                
                {project.client ? (
                  <p className="text-sm font-medium text-muted-foreground mb-6">
                    {project.client.company || project.client.name}
                  </p>
                ) : project.client_id ? (
                  <p className="text-sm font-medium text-muted-foreground mb-6">
                    Client Project
                  </p>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground mb-6 italic">
                    Internal Project
                  </p>
                )}
              </div>

              <div className="pt-4 mt-auto border-t border-border/50 flex items-center justify-between text-xs font-medium text-muted-foreground relative z-10">
                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Tasks</span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
            
            {isPending && (
              <div className="px-6 pb-6 pt-2 relative z-20">
                <Button 
                  onClick={() => handleAccept(project.id)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Accept Request
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
