'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProjectMessages(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      author:profiles!messages_user_id_fkey(id, full_name, avatar_url, email)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data
}

export async function sendMessage(projectId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('messages')
    .insert({
      project_id: projectId,
      user_id: user.id,
      content
    })

  if (error) {
    console.error('Error sending message:', error)
    throw new Error('Failed to send message')
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
}
