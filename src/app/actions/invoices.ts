'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from './workspaces'
import { revalidatePath } from 'next/cache'

export async function createInvoice(data: {
  client_id: string
  project_id?: string
  currency: string
  due_date: string
  notes?: string
  items: { description: string; quantity: number; unit_rate: number }[]
}) {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!workspaceId || !user) throw new Error('Not authenticated')

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Generate invoice number
  const { count } = await adminClient
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    
  const invoiceNum = `INV-${String((count || 0) + 1).padStart(4, '0')}`

  // Calculate total
  const amount = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_rate), 0)

  const { data: invoice, error: invoiceError } = await adminClient
    .from('invoices')
    .insert({
      workspace_id: workspaceId,
      client_id: data.client_id,
      project_id: data.project_id || null,
      created_by: user.id,
      invoice_number: invoiceNum,
      amount,
      currency: data.currency,
      status: 'draft',
      due_date: data.due_date,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (invoiceError) {
    console.error('Error creating invoice:', invoiceError)
    throw new Error('Failed to create invoice')
  }

  // Insert items
  const itemsToInsert = data.items.map(item => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_rate: item.unit_rate,
    total: item.quantity * item.unit_rate
  }))

  const { error: itemsError } = await adminClient
    .from('invoice_items')
    .insert(itemsToInsert)

  if (itemsError) {
    console.error('Error adding invoice items:', itemsError)
    throw new Error('Failed to add invoice items')
  }

  revalidatePath('/dashboard/invoices')
  return invoice
}

export async function getInvoices() {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()

  if (!workspaceId) return []

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(name, company),
      project:projects(name)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return data
}

export async function getClientInvoices() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      project:projects(name)
    `)
    .neq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client invoices:', error)
    return []
  }

  return data
}

export async function getInvoiceById(invoiceId: string) {
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()

  if (!workspaceId) return null

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(name, company, email),
      project:projects(name),
      items:invoice_items(*)
    `)
    .eq('id', invoiceId)
    .eq('workspace_id', workspaceId)
    .single()

  if (error) {
    console.error('Error fetching invoice:', error)
    return null
  }

  return data
}

export async function updateInvoiceStatus(invoiceId: string, status: 'draft' | 'sent' | 'paid' | 'overdue') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId)

  if (error) {
    console.error('Error updating status:', error)
    throw new Error('Failed to update status')
  }

  if (status === 'sent') {
    // We would trigger an email or notification here
    const { data: { user } } = await supabase.auth.getUser()
    const { data: invoice } = await supabase.from('invoices').select('workspace_id, client_id, invoice_number').eq('id', invoiceId).single()
    
    if (invoice && user) {
       // Find client user to notify
       const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
       const adminClient = createSupabaseClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.SUPABASE_SERVICE_ROLE_KEY!
       )
       
       const { data: clientUser } = await adminClient
         .from('client_users')
         .select('user_id')
         .eq('client_id', invoice.client_id)
         .single()
         
       if (clientUser) {
         await adminClient.from('app_notifications').insert({
           workspace_id: invoice.workspace_id,
           user_id: clientUser.user_id,
           title: 'New Invoice Received',
           message: `Invoice ${invoice.invoice_number} is ready for payment.`,
           link: `/portal/invoices/${invoiceId}`
         })
       }
    }
  }

  revalidatePath(`/dashboard/invoices/${invoiceId}`)
  revalidatePath('/dashboard/invoices')
  revalidatePath('/portal/invoices')
}
