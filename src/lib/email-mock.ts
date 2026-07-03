export type EmailOptions = {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendMockEmail(options: EmailOptions) {
  // Simulate network latency of sending an email via Resend
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const to = Array.isArray(options.to) ? options.to.join(', ') : options.to
  const from = options.from || 'AgencyPortal <hello@agencyportal.mock>'

  // In development, we just beautifully log the email to the Next.js server console!
  console.log('\n======================================================')
  console.log(`✉️  MOCK EMAIL DISPATCHED`)
  console.log(`======================================================`)
  console.log(`FROM:    ${from}`)
  console.log(`TO:      ${to}`)
  console.log(`SUBJECT: ${options.subject}`)
  console.log(`------------------------------------------------------`)
  console.log(`BODY (HTML):`)
  console.log(`${options.html.replace(/<[^>]*>?/gm, '')}`) // Strip HTML tags for clean console reading
  console.log(`======================================================\n`)

  return { 
    success: true, 
    messageId: `resend_mock_${Date.now()}_${Math.random().toString(36).substring(7)}` 
  }
}
