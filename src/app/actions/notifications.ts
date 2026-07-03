'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('app_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('app_notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) {
    console.error('Error marking notification read:', error)
    throw new Error('Failed to mark read')
  }

  revalidatePath('/dashboard')
  revalidatePath('/portal')
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('app_notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all read:', error)
    throw new Error('Failed to mark all read')
  }

  revalidatePath('/dashboard')
  revalidatePath('/portal')
}
