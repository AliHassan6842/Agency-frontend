import { createClient } from '@/lib/supabase/server'
import { getCurrentWorkspaceId } from '@/app/actions/workspaces'
import { STRIPE_PLANS } from '@/lib/stripe-mock'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { checkoutAction, manageSubscriptionAction } from '@/app/actions/billing'
import { MockPaymentProcessor } from '@/components/billing/mock-payment-processor'

export default async function BillingPage(props: { searchParams: Promise<{ success?: string, price_id?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const workspaceId = await getCurrentWorkspaceId()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  const currentPlan = workspace?.plan || 'free'

  return (
    <div className="flex-1 space-y-8 max-w-5xl mx-auto w-full pb-10">
      <div className="space-y-1">
        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent pb-1">
          Billing & Plans
        </h2>
        <p className="text-muted-foreground font-medium">
          Manage your agency's subscription and billing details.
        </p>
      </div>

      {searchParams.success && searchParams.price_id && (
        <MockPaymentProcessor priceId={searchParams.price_id} />
      )}

      {currentPlan !== 'free' && (
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-500/10 to-violet-500/10 backdrop-blur-xl p-6 shadow-sm">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-indigo-500" />
                Active Subscription
              </h3>
              <p className="text-muted-foreground">
                You are currently on the <span className="font-semibold text-foreground capitalize">{currentPlan}</span> plan.
              </p>
            </div>
            <form action={manageSubscriptionAction}>
              <Button type="submit" variant="outline" className="border-indigo-500/30 hover:bg-indigo-500/10">Manage Subscription</Button>
            </form>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 pt-4">
        {Object.entries(STRIPE_PLANS).map(([key, plan]) => {
          const isCurrentPlan = currentPlan === key
          
          return (
            <div key={key} className={`group relative flex flex-col rounded-2xl border bg-card/50 backdrop-blur-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isCurrentPlan ? 'border-indigo-500 shadow-md shadow-indigo-500/10' : 'hover:border-indigo-500/30'}`}>
              
              {isCurrentPlan && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
              )}

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold group-hover:text-indigo-500 transition-colors">{plan.name}</h3>
                  {isCurrentPlan && (
                    <Badge variant="default" className="bg-indigo-500 text-white border-0">Current Plan</Badge>
                  )}
                </div>
                <div className="flex items-baseline text-4xl font-extrabold text-foreground">
                  {plan.price}
                  <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{plan.description}</p>
              </div>
              
              <div className="flex-1 mb-6">
                <ul className="space-y-3 text-sm font-medium">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-indigo-500/10 text-indigo-500">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-auto pt-6 border-t border-border/50">
                <form action={checkoutAction.bind(null, plan.priceId)} className="w-full">
                  <Button 
                    type="submit" 
                    className="w-full h-11 transition-all" 
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Active' : 'Subscribe'}
                  </Button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
