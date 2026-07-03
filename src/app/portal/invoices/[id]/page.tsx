import { getInvoiceById } from '@/app/actions/invoices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PortalInvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const invoice = await getInvoiceById(params.id)

  if (!invoice || invoice.status === 'draft') notFound()

  const statusColors = {
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  const items = invoice.items || []

  return (
    <div className="flex-1 space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/portal/invoices" />}>
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
          {invoice.status === 'sent' && (
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">From</p>
              <p className="font-semibold text-lg">Your Agency</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground mb-1">Billed To</p>
              <p className="font-semibold">{invoice.client?.company || invoice.client?.name}</p>
              <p className="text-muted-foreground">{invoice.client?.email}</p>
            </div>
          </div>

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
                  <td colSpan={3} className="text-right font-semibold p-4">Total Due:</td>
                  <td className="text-right font-bold text-xl text-primary p-4">
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
  )
}
