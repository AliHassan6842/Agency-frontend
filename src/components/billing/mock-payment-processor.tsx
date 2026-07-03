'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockProcessSuccessfulPayment } from '@/app/actions/billing'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function MockPaymentProcessor({ priceId }: { priceId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'success'>('processing')

  useEffect(() => {
    async function process() {
      try {
        await mockProcessSuccessfulPayment(priceId)
        setStatus('success')
        
        // Remove the success query params after a delay
        setTimeout(() => {
          router.replace('/dashboard/settings/billing')
        }, 3000)
      } catch (e) {
        console.error('Failed to process mock payment', e)
      }
    }
    
    process()
  }, [priceId, router])

  if (status === 'processing') {
    return (
      <div className="relative w-full rounded-lg border p-4 bg-primary/5 border-primary/20 flex flex-col gap-1">
        <div className="flex items-center gap-2 font-medium tracking-tight">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Processing Payment...
        </div>
        <div className="text-sm text-muted-foreground ml-6">
          Simulating a Stripe webhook processing your subscription. Please wait...
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-lg border p-4 bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400 flex flex-col gap-1">
      <div className="flex items-center gap-2 font-medium tracking-tight">
        <CheckCircle2 className="h-4 w-4 !text-green-600 dark:!text-green-400" />
        Payment Successful!
      </div>
      <div className="text-sm opacity-90 ml-6">
        Your subscription has been activated. Thank you for testing the mock checkout!
      </div>
    </div>
  )
}
