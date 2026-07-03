'use client'

import { useEffect, useState } from 'react'
import { getTransactionHistoryAction } from '@/app/actions/billing'
import { Download, Receipt } from 'lucide-react'

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const history = await getTransactionHistoryAction()
        setTransactions(history)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Receipt className="h-8 w-8 text-indigo-500" />
          Transaction History
        </h1>
        <p className="text-muted-foreground mt-2">View all your past payments, invoices, and plan history.</p>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Plan / Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading transaction history...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No transactions found.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
                        {tx.plan.replace('1 × ', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">${tx.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.invoice_pdf ? (
                        <a href={tx.invoice_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium">
                          <Download className="h-4 w-4" /> PDF
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-card rounded-2xl border shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Manage Your Subscription</h3>
          <p className="text-muted-foreground text-sm">Need more features or want to downgrade? Update your plan at any time.</p>
        </div>
        <a 
          href="/onboarding/billing" 
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 active:scale-95 whitespace-nowrap"
        >
          Change Plan
        </a>
      </div>
    </div>
  )
}
