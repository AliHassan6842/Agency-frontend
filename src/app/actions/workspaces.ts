'use server'

import { createClient } from '@/lib/supabase/server'

export async function getCurrentWorkspaceId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch all workspaces the user has access to as staff/owner
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('id, name')
    .limit(1)

  if (!error && workspaces && workspaces.length > 0) {
    return workspaces[0].id
  }

  // If not staff, check if they are a client
  // Use adminClient because client_users has no RLS policy allowing SELECT for clients
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: clientUser } = await adminClient
    .from('client_users')
    .select('clients(workspace_id)')
    .eq('user_id', user.id)
    .single()

  if (clientUser && clientUser.clients) {
    // @ts-expect-error Type system does not infer relation correctly
    return clientUser.clients.workspace_id
  }

  return null
}
