import { getClientInvoices } from '@/app/actions/invoices'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default async function PortalInvoicesPage() {
  const invoices = await getClientInvoices()

  const statusColors = {
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing & Invoices</h2>
        <p className="text-muted-foreground mt-1">
          View your payment history and outstanding balances.
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 rounded-xl border border-dashed p-12 text-center bg-card">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No invoices</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
            You don&apos;t have any pending or past invoices. When the agency bills you, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Link key={invoice.id} href={`/portal/invoices/${invoice.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{invoice.invoice_number}</p>
                        <Badge variant="secondary" className={statusColors[invoice.status as keyof typeof statusColors]}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {invoice.project?.name || 'General Billing'}
                        {invoice.due_date && ` • Due ${new Date(invoice.due_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <p className="font-bold text-lg">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
