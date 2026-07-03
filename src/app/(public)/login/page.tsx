import { login } from '@/app/actions/auth'
import { Hexagon, Lock, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const errorMsg = searchParams?.error

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual Side */}
      <div className="relative hidden lg:flex flex-col bg-zinc-950 p-10 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        
        <div className="relative z-10 flex items-center gap-2 font-bold text-2xl tracking-tight">
          <Hexagon className="h-8 w-8 text-indigo-400" />
          Antigravity AI
        </div>
        
        <div className="relative z-10 mt-auto mb-10">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
            Accelerate your agency workflow.
          </h1>
          <p className="text-zinc-400 text-lg max-w-md">
            Streamline client communication, automate project updates, and deliver results faster with our intelligent portal.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <div className="flex lg:hidden items-center justify-center gap-2 font-bold text-2xl mb-6">
              <Hexagon className="h-8 w-8 text-indigo-500" />
              Antigravity AI
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access your portal
            </p>
          </div>

          <form action={login} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm font-medium text-center">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-2 relative">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="m@example.com"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <Link href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="group relative flex h-10 w-full items-center justify-center overflow-hidden rounded-md bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center gap-2">
                Sign In <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-zinc-900 dark:text-white hover:underline transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
