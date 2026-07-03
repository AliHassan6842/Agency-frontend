import { signup } from '@/app/actions/auth'
import { Hexagon, Lock, Mail, User, ArrowRight, Building2, Phone } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function RegisterPage(props: { searchParams: Promise<{ error?: string, invite?: string }> }) {
  const searchParams = await props.searchParams
  const errorMsg = searchParams?.error
  const inviteCode = searchParams?.invite || ''

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950 order-2 lg:order-1">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <div className="flex lg:hidden items-center justify-center gap-2 font-bold text-2xl mb-6">
              <Hexagon className="h-8 w-8 text-indigo-500" />
              Antigravity AI
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground text-sm">
              Enter your details to get started
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}

          <Tabs defaultValue={inviteCode ? "client" : "agency"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client">Register as Client</TabsTrigger>
              <TabsTrigger value="agency">Register Agency</TabsTrigger>
            </TabsList>

            {/* CLIENT REGISTRATION TAB */}
            <TabsContent value="client">
              <form action={signup} className="space-y-4">
                <input type="hidden" name="user_type" value="client" />
                
                <div className="space-y-2 relative">
                  <label htmlFor="invite_code" className="text-sm font-medium leading-none">Agency Invite Code (Required)</label>
                  <div className="relative">
                    <Link href="#" className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      id="invite_code" name="invite_code" type="text" required defaultValue={inviteCode} placeholder="Paste Agency URL or Code here"
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 relative">
                    <label htmlFor="name_client" className="text-sm font-medium leading-none">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input id="name_client" name="name" type="text" required placeholder="John Doe" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="space-y-2 relative">
                    <label htmlFor="phone" className="text-sm font-medium leading-none">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:ring-indigo-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label htmlFor="company" className="text-sm font-medium leading-none">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input id="company" name="company" type="text" required placeholder="Acme Corp" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:ring-indigo-500" />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label htmlFor="email_client" className="text-sm font-medium leading-none">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input id="email_client" name="email" type="email" required placeholder="m@example.com" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:ring-indigo-500" />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label htmlFor="password_client" className="text-sm font-medium leading-none">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input id="password_client" name="password" type="password" required placeholder="••••••••" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:ring-indigo-500" />
                  </div>
                </div>

                <button type="submit" className="group relative flex h-10 w-full items-center justify-center overflow-hidden rounded-md bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative flex items-center gap-2">Join Agency <ArrowRight className="h-4 w-4" /></span>
                </button>
              </form>
            </TabsContent>

            {/* AGENCY REGISTRATION TAB */}
            <TabsContent value="agency">
              <form action={signup} className="space-y-4">
                <input type="hidden" name="user_type" value="agency" />
                <div className="space-y-2 relative">
                  <label htmlFor="name_agency" className="text-sm font-medium leading-none">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input id="name_agency" name="name" type="text" required placeholder="John Doe" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:ring-indigo-500" />
                  </div>
                </div>
                
                <div className="space-y-2 relative">
                  <label htmlFor="email_agency" className="text-sm font-medium leading-none">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input id="email_agency" name="email" type="email" required placeholder="m@example.com" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:ring-indigo-500" />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label htmlFor="password_agency" className="text-sm font-medium leading-none">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input id="password_agency" name="password" type="password" required placeholder="••••••••" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:ring-indigo-500" />
                  </div>
                </div>

                <button type="submit" className="group relative flex h-10 w-full items-center justify-center overflow-hidden rounded-md bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative flex items-center gap-2">Create Agency <ArrowRight className="h-4 w-4" /></span>
                </button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-zinc-900 dark:text-white hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Side */}
      <div className="relative hidden lg:flex flex-col bg-zinc-950 p-10 text-white overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/20 via-pink-500/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        
        <div className="relative z-10 flex items-center gap-2 font-bold text-2xl tracking-tight justify-end">
          Antigravity AI
          <Hexagon className="h-8 w-8 text-purple-400" />
        </div>
        
        <div className="relative z-10 mt-auto mb-10 text-right">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
            Join the future of agencies.
          </h1>
          <p className="text-zinc-400 text-lg max-w-md ml-auto">
            Experience an AI-driven workspace that adapts to your needs and supercharges your team&apos;s productivity.
          </p>
        </div>
      </div>
    </div>
  )
}
