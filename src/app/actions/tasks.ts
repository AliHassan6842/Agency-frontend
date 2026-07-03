'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from './workspaces'
import { revalidatePath } from 'next/cache'

export async function getTasks(projectId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const workspaceId = await getCurrentWorkspaceId()
  if (!workspaceId) return []

  // Check if user is a client
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  let query = supabase
    .from('tasks')
    .select(`
      *,
      project:projects(workspace_id)
    `)

  if (projectId) {
    query = query.eq('project_id', projectId)
  } else {
    // If no project ID is provided, fetch all tasks for projects in this workspace
    // Wait, the tasks table doesn't have workspace_id directly. We need to filter by projects that belong to the workspace.
    // Instead of complex join for filtering, we can just get all project IDs for the workspace first.
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('workspace_id', workspaceId)
      
    const projectIds = projects?.map(p => p.id) || []
    if (projectIds.length === 0) return []
    
    query = query.in('project_id', projectIds)
  }

  // If the user is a client (exists in client_users), ONLY show client_visible tasks
  if (clientUser) {
    query = query.eq('client_visible', true)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data
}

export async function moveTaskAction(taskId: string, newStatus: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)

  if (error) {
    console.error('Error moving task:', error)
    throw new Error('Failed to move task')
  }

  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard/projects/[id]', 'page')
}

export async function createTaskAction(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const projectId = formData.get('project_id') as string
  const priority = formData.get('priority') as string || 'medium'
  const status = formData.get('status') as string || 'todo'
  const clientVisible = formData.get('client_visible') === 'true'
  
  if (!projectId) throw new Error('Project is required')

  const { error } = await supabase
    .from('tasks')
    .insert({
      title,
      description,
      project_id: projectId,
      priority,
      status,
      client_visible: clientVisible
    })

  if (error) {
    console.error('Error creating task:', error)
    throw new Error('Failed to create task')
  }

  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard/projects/[id]', 'page')
}
