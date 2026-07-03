'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from './workspaces'
import { revalidatePath } from 'next/cache'

export async function createTicket(data: {
  title: string
  description: string
  priority: string
  client_id?: string
  project_id?: string
}) {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!workspaceId || !user) throw new Error('Not authenticated')

  let clientIdToUse = data.client_id;
  
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // If not provided, check if user is a client and use their client_id
  if (!clientIdToUse) {
    const { data: clientUser } = await adminClient
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .single()
    
    if (clientUser) {
      clientIdToUse = clientUser.client_id
    }
  }

  const { data: ticket, error } = await adminClient
    .from('tickets')
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      client_id: clientIdToUse || null,
      project_id: data.project_id || null,
      status: 'open'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating ticket:', error)
    throw new Error('Failed to create ticket')
  }

  // Send Email Notification to Agency via Backend API
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api/email/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        title: data.title,
        priority: data.priority,
        description: data.description,
        ticketId: ticket.id
      })
    }).catch(err => console.error('Failed to call backend email API:', err))
  }

  revalidatePath('/dashboard/tickets')
  revalidatePath('/portal/tickets')
  return ticket
}

export async function getTickets() {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()

  if (!workspaceId) return []

  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      client:clients(name, company),
      project:projects(name),
      author:profiles!tickets_created_by_fkey(full_name, email)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tickets:', error)
    return []
  }

  return data
}

export async function getClientTickets() {
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
    .from('tickets')
    .select(`
      *,
      project:projects(name)
    `)
    .eq('client_id', clientUser.client_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client tickets:', error)
    return []
  }

  return data
}

export async function getTicketById(ticketId: string) {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()

  if (!workspaceId) return null

  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      client:clients(name, company),
      project:projects(name),
      author:profiles!tickets_created_by_fkey(full_name, email)
    `)
    .eq('id', ticketId)
    .eq('workspace_id', workspaceId)
    .single()

  if (error) {
    console.error('Error fetching ticket:', error)
    return null
  }

  return data
}

export async function getTicketReplies(ticketId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ticket_replies')
    .select(`
      *,
      author:profiles!ticket_replies_user_id_fkey(full_name, email, avatar_url)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching replies:', error)
    return []
  }

  return data
}

export async function addTicketReply(ticketId: string, content: string, isInternal: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await adminClient
    .from('ticket_replies')
    .insert({
      ticket_id: ticketId,
      user_id: user.id,
      content,
      is_internal: isInternal
    })

  if (error) {
    console.error('Error adding reply:', error)
    throw new Error('Failed to add reply')
  }

  // Send Email Notification for new reply via Backend API
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!isInternal && session) {
    await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api/email/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        ticketId,
        content,
        isInternal
      })
    }).catch(err => console.error('Failed to call backend email API:', err))
  }

  revalidatePath(`/dashboard/tickets/${ticketId}`)
  revalidatePath(`/portal/tickets/${ticketId}`)
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId)

  if (error) {
    console.error('Error updating status:', error)
    throw new Error('Failed to update status')
  }

  revalidatePath(`/dashboard/tickets/${ticketId}`)
  revalidatePath('/dashboard/tickets')
}
