'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from './workspaces'
import { revalidatePath } from 'next/cache'

export async function getCurrentClientFileContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('client_users')
    .select('client_id, client:clients(workspace_id)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error('Error fetching client file context:', error)
    return null
  }

  const client = Array.isArray(data.client) ? data.client[0] : data.client

  return {
    clientId: data.client_id,
    workspaceId: client?.workspace_id ?? null,
  }
}

export async function saveFileMetadata(data: {
  file_name: string
  file_path: string
  file_size: number
  content_type: string
  project_id?: string
  client_id?: string
}) {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!workspaceId || !user) throw new Error('No workspace found')

  const { data: fileData, error } = await supabase
    .from('files')
    .insert({
      workspace_id: workspaceId,
      project_id: data.project_id || null,
      client_id: data.client_id || null,
      file_name: data.file_name,
      file_path: data.file_path,
      file_size: data.file_size,
      content_type: data.content_type,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (error || !fileData) {
    console.error('Error saving file metadata:', error)
    throw new Error('Failed to save file metadata')
  }

  // Trigger text extraction and embedding webhook asynchronously
  // We don't await the response body so we don't block the UI
  fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api/webhooks/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record: fileData })
  }).catch(err => console.error('Failed to trigger webhook:', err));

  revalidatePath('/dashboard/files')
  if (data.project_id) {
    revalidatePath(`/dashboard/projects/${data.project_id}`)
  }
}

export async function getFiles(projectId?: string) {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()

  if (!workspaceId) return []

  let query = supabase
    .from('files')
    .select(`
      *,
      project:projects(name),
      client:clients(name, company)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching files:', error)
    return []
  }

  return data
}

export async function getClientFiles(projectId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const context = await getCurrentClientFileContext()

  if (!context?.clientId || !user) return []

  let query = supabase
    .from('files')
    .select(`
      *,
      project:projects(name),
      client:clients(name, company)
    `)
    .eq('client_id', context.clientId)
    .or(`client_visible.eq.true,uploaded_by.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching client files:', error)
    return []
  }

  return data
}

export async function getFileSignedUrl(filePath: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null

  const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api/files/download-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ filePath })
  })

  if (!res.ok) {
    console.error('Error fetching signed url from backend')
    return null
  }

  const data = await res.json()
  return data.signedUrl
}

export async function deleteFileAction(fileId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) throw new Error('Not authenticated')

  const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api/files/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ fileId })
  })

  if (!res.ok) {
    console.error('Error deleting file via backend')
    throw new Error('Failed to delete file')
  }

  revalidatePath('/dashboard/files')
}
