'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from './workspaces'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function checkoutAction(priceId: string) {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()
  if (!workspaceId) throw new Error('Not authenticated')

  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api/billing/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    },
    body: JSON.stringify({ priceId, workspaceId })
  })

  const text = await res.text()
  let data;
  try {
    data = JSON.parse(text)
  } catch (err) {
    console.error('Backend returned non-JSON:', text)
    throw new Error('Backend returned invalid response')
  }

  if (data.url) {
    redirect(data.url)
  } else {
    throw new Error('Failed to create checkout session')
  }
}

export async function manageSubscriptionAction() {
  // Typically calls an API to create a Customer Portal session
  const workspaceId = await getCurrentWorkspaceId()
  if (!workspaceId) throw new Error('Not authenticated')
  
  // For the boilerplate, redirecting to a manual portal link or returning error
  redirect('https://billing.stripe.com/p/login/test_YOUR_URL_HERE')
}

// Deprecated mock payment processor
export async function mockProcessSuccessfulPayment(priceId: string) {
  revalidatePath('/dashboard/settings/billing')
}

export async function getTransactionHistoryAction() {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()
  if (!workspaceId) throw new Error('Not authenticated')

  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/billing/history/${workspaceId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`
    }
  })

  if (!res.ok) {
    return []
  }

  const data = await res.json()
  return data.transactions || []
}

export async function verifySessionAction(sessionId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/billing/verify-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    },
    body: JSON.stringify({ sessionId })
  })

  if (!res.ok) {
    throw new Error('Verification failed')
  }

  const data = await res.json()
  if (data.success) {
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/history')
    return data.plan
  }
  return null
}
