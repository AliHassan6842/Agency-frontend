'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from './workspaces'
import { revalidatePath } from 'next/cache'

export async function getProjects() {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()

  if (!workspaceId) return []

  // Fetch projects and join with clients table to get the client name
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(name, company)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data
}

export async function getClientProjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .single()

  if (!clientUser?.client_id) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientUser.client_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client projects:', error)
    return []
  }
  return data
}

export async function getProjectById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching project:', error)
    }
    return null
  }

  return data
}

export async function createProjectAction(formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()

  if (!workspaceId) throw new Error('No active workspace found')

  // ENFORCE PLAN LIMITS
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('plan')
    .eq('id', workspaceId)
    .single()

  if (workspace?.plan === 'starter') {
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      
    if (count !== null && count >= 3) {
      throw new Error('PLAN_LIMIT_REACHED: Starter plan is limited to 3 active projects. Please upgrade to Pro or Enterprise.')
    }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const clientId = formData.get('client_id') as string

  const { error } = await supabase
    .from('projects')
    .insert({
      workspace_id: workspaceId,
      name,
      description,
      client_id: clientId || null,
      status: 'planning'
    })

  if (error) {
    console.error('Error creating project:', error)
    throw new Error('Failed to create project')
  }

  revalidatePath('/dashboard/projects')
}

export async function createClientProjectAction(formData: FormData) {
  const supabase = await createClient()
  
  // Get the client's associated workspace_id and client_id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id, client:clients(workspace_id)')
    .eq('user_id', user.id)
    .single()

  if (!clientUser || !clientUser.client) {
    throw new Error('Client profile not found')
  }

  const clientId = clientUser.client_id
  const workspaceId = Array.isArray(clientUser.client) 
    ? (clientUser.client as any)[0].workspace_id 
    : (clientUser.client as any).workspace_id

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  // Insert project as pending_approval
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      workspace_id: workspaceId,
      name,
      description,
      client_id: clientId,
      status: 'pending_approval'
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating project request:', error)
    throw new Error('Failed to create project request')
  }

  // Notify Admins
  const { data: admins } = await supabase
    .from('workspace_members')
    .select('user_id, profiles!inner(role)')
    .eq('workspace_id', workspaceId)

  if (admins) {
    const adminIds = admins.filter(a => {
      const profile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles as any;
      return profile?.role === 'admin' || profile?.role === 'staff';
    }).map(a => a.user_id)
    
    // Create notifications for each admin
    const notifications = adminIds.map(adminId => ({
      user_id: adminId,
      title: 'New Project Request',
      message: `Client has requested a new project: ${name}. Please review and accept.`,
      link: '/dashboard/projects',
      is_read: false
    }))

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications)
    }
  }

  revalidatePath('/portal/projects')
}

export async function acceptProjectAction(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .update({ status: 'planning' })
    .eq('id', id)

  if (error) {
    console.error('Error accepting project:', error)
    throw new Error('Failed to accept project')
  }

  revalidatePath('/dashboard/projects')
}

export async function updateProjectAction(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string

  const { error } = await supabase
    .from('projects')
    .update({ name, description, status })
    .eq('id', id)

  if (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project')
  }

  revalidatePath(`/dashboard/projects/${id}`)
  revalidatePath('/dashboard/projects')
}

export async function deleteProjectAction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project')
  }

  revalidatePath('/dashboard/projects')
}
