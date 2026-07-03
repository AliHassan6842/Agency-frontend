'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from './workspaces'

export async function chatWithDocument(message: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return { error: 'Unauthorized' }
  }

  const workspaceId = await getCurrentWorkspaceId()
  
  if (!workspaceId) {
    return { error: 'No workspace found' }
  }

  try {
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api/ai/document-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ message, workspaceId })
    })
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error('Chat action error:', error)
    return { error: 'Failed to communicate with AI server' }
  }
}
