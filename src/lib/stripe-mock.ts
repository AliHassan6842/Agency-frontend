export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    price: '$49',
    description: 'Perfect for freelancers and small teams.',
    features: ['Up to 3 Active Projects', 'Unlimited Clients', 'Realtime Chat', 'Standard Support'],
    priceId: 'mock_price_starter',
  },
  pro: {
    name: 'Pro Agency',
    price: '$199',
    description: 'For scaling agencies that need advanced AI tools.',
    features: ['Unlimited Projects', 'AI Project Summaries', 'Custom Branding', 'Priority Support', '1TB Storage'],
    priceId: 'mock_price_pro',
  },
  enterprise: {
    name: 'Enterprise',
    price: '$499',
    description: 'For massive agencies requiring full white-labeling.',
    features: ['Everything in Pro', 'Custom Domain', 'Dedicated Account Manager', 'Unlimited Storage', 'SLA Guarantee'],
    priceId: 'mock_price_enterprise',
  },
}

export async function createMockCheckoutSession(priceId: string, workspaceId: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Return URL to our fake mock checkout page instead of instantly succeeding
  return {
    url: `/mock-checkout?price_id=${priceId}`
  }
}

export async function createMockCustomerPortal(workspaceId: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // In a real app, this would return a Stripe Customer Portal URL
  return {
    url: `/dashboard/settings/billing?portal=true`
  }
}
