'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  
  const userType = formData.get('user_type') as string
  const inviteCode = formData.get('invite_code') as string
  const company = formData.get('company') as string
  const phone = formData.get('phone') as string

  let cleanInviteCode = inviteCode?.trim() || ''
  
  // Extract from URL if the user pasted the full link
  try {
    const url = new URL(cleanInviteCode)
    const urlParam = url.searchParams.get('invite')
    if (urlParam) cleanInviteCode = urlParam
  } catch {
    // Ignore, it's probably just the raw code
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // If client, verify invite code using Admin Client since unauth users can't read workspaces
  if (userType === 'client') {
    if (!cleanInviteCode || !uuidRegex.test(cleanInviteCode)) {
      redirect('/register?error=Invalid Agency Invite Code format')
    }

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: workspace, error: wsError } = await adminClient.from('workspaces').select('id').eq('id', cleanInviteCode).single()
    
    if (wsError || !workspace) {
      redirect('/register?error=Invalid Agency Invite Code')
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  })

  if (error || !data.user) {
    redirect('/register?error=Could not sign up user')
  }

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (userType !== 'client') {
    // Explicitly set the agency owner to 'admin' so they don't default to 'client'
    await adminClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', data.user.id)

    // Auto-create their workspace so the dashboard layout detects their free plan and blocks them
    const { data: workspace } = await adminClient
      .from('workspaces')
      .insert({
        name: company || `${name}'s Agency`,
        slug: `${(company || name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random() * 1000)}`,
        owner_id: data.user.id,
        plan: 'free'
      })
      .select('id')
      .single()

    if (workspace) {
      await adminClient
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: data.user.id,
          role: 'admin'
        })
    }
  }

  if (userType === 'client' && cleanInviteCode) {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: clientData } = await adminClient
      .from('clients')
      .insert({
        workspace_id: cleanInviteCode,
        name: name,
        company: company,
        email: email,
        phone: phone
      })
      .select('id')
      .single()
      
    if (clientData) {
      await adminClient
        .from('client_users')
        .insert({
          client_id: clientData.id,
          user_id: data.user.id
        })
    }
  }

  revalidatePath('/', 'layout')
  
  if (userType === 'client') {
    redirect('/portal')
  } else {
    redirect('/dashboard')
  }
}
