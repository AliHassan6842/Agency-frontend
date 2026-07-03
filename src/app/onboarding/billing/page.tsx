'use client'

import { checkoutAction } from '@/app/actions/billing'
import { buttonVariants } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const PLANS = [
  { name: "Starter", price: "$49", description: "Perfect for freelancers and small teams.", features: ["Up to 3 Active Projects", "Unlimited Clients"], popular: false, priceId: "price_1StarterMock" },
  { name: "Pro Agency", price: "$199", description: "For scaling agencies that need advanced AI tools.", features: ["Unlimited Projects", "AI Project Summaries", "Custom Branding"], popular: true, priceId: "price_1ProMock" },
  { name: "Enterprise", price: "$499", description: "For massive agencies requiring full white-labeling.", features: ["Everything in Pro", "Custom Domain", "Dedicated Account Manager"], popular: false, priceId: "price_1EnterpriseMock" }
]

export default function OnboardingBillingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId)
    await checkoutAction(priceId)
    // No finally block needed if it redirects, but just in case it doesn't:
    setLoading(null)
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-background flex flex-col items-center justify-center">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Select your plan to continue</h1>
          <p className="text-lg text-muted-foreground">You need an active subscription to access the admin dashboard.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <div 
              key={i} 
              className={cn(
                "relative flex flex-col rounded-3xl p-8 border bg-card text-card-foreground shadow-sm transition-all hover:shadow-2xl",
                plan.popular ? "border-indigo-500 shadow-indigo-500/10 scale-105" : "border-border/50"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-black tracking-tight">{plan.price}</span><span className="text-muted-foreground">/mo</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading !== null}
                className={cn(
                  buttonVariants({ size: "lg", variant: plan.popular ? "default" : "outline" }), 
                  "w-full rounded-xl transition-all",
                  plan.popular ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""
                )}
              >
                {loading === plan.priceId ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
