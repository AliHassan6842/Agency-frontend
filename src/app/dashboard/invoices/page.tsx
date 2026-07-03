import { getInvoices } from '@/app/actions/invoices'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, FileText, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { CreateInvoiceDialog } from './create-invoice-dialog'
import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from '@/app/actions/workspaces'

export default async function InvoicesPage() {
  const invoices = await getInvoices()
  
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()
  
  const { data: clients } = await supabase.from('clients').select('id, name, company').eq('workspace_id', workspaceId)
  const { data: projects } = await supabase.from('projects').select('id, name, client_id').eq('workspace_id', workspaceId)

  const statusColors = {
    draft: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent pb-1">
            Invoices
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            Manage billing, send invoices, and track payments.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-8"
            />
          </div>
          <CreateInvoiceDialog clients={clients || []} projects={projects || []} />
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 rounded-xl border border-dashed p-12 text-center bg-card">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No invoices yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
            Create your first invoice to bill a client for your agency&apos;s services.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {invoices.map((invoice) => (
            <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`} className="group relative block rounded-2xl border bg-card/50 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/30 overflow-hidden">
              
              <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                <FileText className="w-40 h-40 text-indigo-500 -rotate-12" />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-lg group-hover:text-indigo-500 transition-colors">{invoice.invoice_number}</p>
                      <Badge variant="secondary" className={`${statusColors[invoice.status as keyof typeof statusColors]} border-0 shadow-sm`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {invoice.client?.company || invoice.client?.name || 'Unknown Client'}
                    </p>
                    {invoice.due_date && (
                      <p className="text-xs text-muted-foreground mt-1 bg-muted/50 inline-block px-2 py-0.5 rounded-md">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <p className="font-extrabold text-2xl text-foreground">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-1 bg-muted/50 px-2 py-0.5 rounded-md">
                    Issued {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
