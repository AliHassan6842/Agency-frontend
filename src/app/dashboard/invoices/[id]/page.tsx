import { getInvoiceById, updateInvoiceStatus } from '@/app/actions/invoices'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, ArrowLeft, Send, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const invoice = await getInvoiceById(params.id)

  if (!invoice) notFound()

  const statusColors = {
    draft: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  const items = invoice.items || []

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/dashboard/invoices" />}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Invoice {invoice.invoice_number}</h2>
            <Badge variant="secondary" className={statusColors[invoice.status as keyof typeof statusColors]}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <form action={async () => {
              'use server'
              await updateInvoiceStatus(invoice.id, 'sent')
            }}>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Send to Client
              </Button>
            </form>
          )}
          {invoice.status === 'sent' && (
            <form action={async () => {
              'use server'
              await updateInvoiceStatus(invoice.id, 'paid')
            }}>
              <Button type="submit" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left font-medium p-4">Description</th>
                      <th className="text-right font-medium p-4">Qty</th>
                      <th className="text-right font-medium p-4">Price</th>
                      <th className="text-right font-medium p-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: { id: string; description: string; quantity: number; unit_rate: number; total: number }) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="p-4">{item.description}</td>
                        <td className="text-right p-4">{item.quantity}</td>
                        <td className="text-right p-4">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(item.unit_rate)}
                        </td>
                        <td className="text-right p-4 font-medium">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t bg-muted/20">
                    <tr>
                      <td colSpan={3} className="text-right font-semibold p-4">Total Amount:</td>
                      <td className="text-right font-bold text-lg p-4">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {invoice.notes && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-medium mb-2 text-sm text-muted-foreground">Notes</h4>
                  <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="font-semibold">{invoice.client?.company || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                <p>{invoice.client?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{invoice.client?.email || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date Issued</p>
                <p>{new Date(invoice.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p className="font-medium text-red-600">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              {invoice.project && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Related Project</p>
                  <p>{invoice.project.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
