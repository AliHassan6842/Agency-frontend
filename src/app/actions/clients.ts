'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from './workspaces'
import { revalidatePath } from 'next/cache'

export async function getClients() {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()

  if (!workspaceId) return []

  const { data: crmClients, error: crmError } = await supabase
    .from('clients')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (crmError) {
    console.error('Error fetching CRM clients:', crmError)
  }

  // Also fetch all registered profiles with role 'client' 
  // (In a real multi-tenant app, this would be filtered by workspace invites)
  const { data: profileClients, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  if (profileError) {
    console.error('Error fetching profile clients:', profileError)
  }

  const merged = [...(crmClients || [])]

  // Add profile clients that aren't already represented (simple email check)
  const existingEmails = new Set(merged.map(c => c.email))
  
  if (profileClients) {
    for (const profile of profileClients) {
      if (!existingEmails.has(profile.email)) {
        merged.push({
          id: profile.id, // Using profile ID directly so they can be clicked
          workspace_id: workspaceId,
          name: profile.full_name || 'Registered Client',
          company: 'Self-Registered',
          email: profile.email,
          phone: '',
          status: 'active',
          created_at: profile.created_at,
          updated_at: profile.updated_at
        })
      }
    }
  }

  return merged
}

export async function getClientById(id: string) {
  const supabase = await createClient()
  
  const { data: crmClient, error: crmError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (crmClient) {
    return crmClient
  }

  // Fallback to profiles if they are a registered client but not in CRM yet
  const { data: profileClient } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (profileClient) {
    return {
      id: profileClient.id,
      workspace_id: null,
      name: profileClient.full_name || 'Registered Client',
      company: 'Self-Registered',
      email: profileClient.email,
      phone: '',
      status: 'active',
      created_at: profileClient.created_at,
      updated_at: profileClient.updated_at
    }
  }

  return null
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()

  if (!workspaceId) throw new Error('No active workspace found')

  const name = formData.get('name') as string
  const company = formData.get('company') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  const { error } = await supabase
    .from('clients')
    .insert({
      workspace_id: workspaceId,
      name,
      company,
      email,
      phone,
      status: 'active'
    })

  if (error) {
    console.error('Error creating client:', error)
    throw new Error('Failed to create client')
  }

  // Send Email Invitation via Backend API
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api/email/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        email,
        name,
        company
      })
    }).catch(err => console.error('Failed to call backend email API:', err))
  }

  revalidatePath('/dashboard/clients')
}
