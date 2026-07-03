'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProjectStore, Project } from '@/store/projects'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, LayoutGrid, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

export function ClientLiveProjectList({ initialProjects }: { initialProjects: Project[] }) {
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
        .channel(`client-projects-${Math.random()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'projects' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
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

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 rounded-xl border border-dashed p-12 text-center bg-card">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <LayoutGrid className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">No active projects</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
          You don&apos;t have any projects assigned to you yet. If you believe this is an error, please contact your account manager.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const isPending = project.status === 'pending_approval'
        
        return (
          <Link key={project.id} href={`/portal/projects/${project.id}`} className="block group">
            <Card className="h-full hover:border-primary/50 transition-colors shadow-sm group-hover:shadow-md relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl line-clamp-2 leading-tight pr-2">{project.name}</CardTitle>
                  <Badge variant={isPending ? 'destructive' : project.status === 'active' ? 'default' : 'secondary'} className="capitalize shrink-0">
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {project.description || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  {isPending ? (
                    <Clock className="h-4 w-4 text-orange-500 opacity-50" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
