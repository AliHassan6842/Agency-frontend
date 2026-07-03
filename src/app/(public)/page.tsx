'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, LayoutGrid, MessageSquare, ShieldCheck, Bot, Check, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <div className="bg-background selection:bg-indigo-500/30 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center justify-center min-h-screen">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-background to-background dark:from-indigo-900/20 dark:via-background dark:to-background -z-10" />
        
        <div className="container relative mx-auto px-4 md:px-8 flex flex-col items-center text-center z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <Badge variant="outline" className="rounded-full px-5 py-2 border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm backdrop-blur-md">
              <span className="flex items-center gap-2 text-sm font-medium tracking-wide">
                <Sparkles className="h-4 w-4" />
                The AI Client Portal for Agencies
              </span>
            </Badge>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[6.5rem] font-bold tracking-tighter max-w-5xl mb-8 leading-[1.05] text-foreground"
          >
            Deliver projects with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 animate-gradient-x">
              zero friction.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 font-medium leading-relaxed"
          >
            A single, beautiful dashboard where your clients can view progress, approve tasks, pay invoices, and chat directly with your team.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
          >
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-base rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-105 active:scale-95")}>
              Start Building Free 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* 3D Dashboard Image Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring", bounce: 0.4 }}
          className="mt-16 md:mt-24 relative w-full max-w-6xl px-4 z-20 origin-top perspective-[2000px]"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-background shadow-2xl">
            {/* macOS window controls mock */}
            <div className="w-full h-12 flex items-center gap-2 px-6 bg-muted/50 border-b border-border/50">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            
            <div className="w-full aspect-video relative bg-slate-900">
              <Image 
                src="/dashboard_mockup.jpg" 
                alt="AgencyPortal AI Dashboard" 
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="py-32 relative z-20 bg-background">
        <div className="container relative mx-auto px-4 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">A completely unified experience.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">Replace the chaotic mess of Google Docs, Email, and Slack with one beautiful portal.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Large Image Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="group relative md:col-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-muted/50 dark:to-muted/20 rounded-3xl border border-border/50 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch"
            >
              <div className="p-10 md:w-1/2 z-10 flex flex-col justify-center">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6">
                  <LayoutGrid className="h-6 w-6 text-violet-600 dark:text-violet-500" />
                </div>
                <h3 className="font-bold text-3xl mb-4 tracking-tight text-foreground">Smart Kanban Boards</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Give clients full transparency. Drag and drop tasks, mark them for approval, and keep project timelines strictly on schedule without endless email threads.
                </p>
              </div>
              <div className="relative md:w-1/2 min-h-[300px] md:min-h-[400px] w-full p-6 md:p-10 flex items-center justify-center">
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border border-border/50 group-hover:scale-105 transition-transform duration-500">
                  <Image src="/kanban_mockup.jpg" alt="Kanban UI" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-left-top" />
                </div>
              </div>
            </motion.div>

            {/* Small Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-slate-50 dark:bg-muted/30 rounded-3xl p-10 border border-border/50 hover:bg-slate-100 dark:hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              </div>
              <h3 className="font-bold text-2xl mb-3 text-foreground">Real-time Client Chat</h3>
              <p className="text-muted-foreground">Keep communication centralized. Your team can chat with clients instantly on a per-project basis.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-slate-50 dark:bg-muted/30 rounded-3xl p-10 border border-border/50 hover:bg-slate-100 dark:hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center mb-6">
                <Bot className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-500" />
              </div>
              <h3 className="font-bold text-2xl mb-3 text-foreground">AI Project Summaries</h3>
              <p className="text-muted-foreground">Automatically generate weekly updates for your clients based on task movements and chat logs.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. PRICING SECTION */}
      <section id="pricing" className="py-32 relative bg-slate-50 dark:bg-muted/20 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your agency's scale. Upgrade, downgrade, or cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter", price: "$49", description: "Perfect for freelancers and small teams.",
                features: ["Up to 3 Active Projects", "Unlimited Clients", "Realtime Chat", "Standard Support"], popular: false
              },
              {
                name: "Pro Agency", price: "$199", description: "For scaling agencies that need advanced AI tools.",
                features: ["Unlimited Projects", "AI Project Summaries", "Custom Branding", "Priority Support", "1TB Storage"], popular: true
              },
              {
                name: "Enterprise", price: "$499", description: "For massive agencies requiring full white-labeling.",
                features: ["Everything in Pro", "Custom Domain", "Dedicated Account Manager", "Unlimited Storage", "SLA Guarantee"], popular: false
              }
            ].map((plan, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -10 }}
                className={cn(
                  "relative flex flex-col rounded-3xl p-8 border bg-card text-card-foreground shadow-sm transition-all hover:shadow-2xl",
                  plan.popular ? "border-indigo-500 shadow-indigo-500/10 z-10 md:scale-105 bg-white dark:bg-card" : "border-border/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
                </div>
                
                <div className="mb-8">
                  <span className="text-5xl font-black tracking-tight text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <div className="rounded-full bg-indigo-500/10 p-1 flex-shrink-0">
                        <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href="/register" 
                  className={cn(
                    buttonVariants({ size: "lg", variant: plan.popular ? "default" : "outline" }), 
                    "w-full rounded-xl transition-transform active:scale-95",
                    plan.popular ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg" : ""
                  )}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS */}
      <section className="py-32 relative bg-background">
        <div className="container relative mx-auto px-4 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">Trusted by top agencies.</h2>
            <p className="text-xl text-muted-foreground">Don't just take our word for it.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: "Sarah Jenkins", role: "CEO, Elevate Marketing", text: "This portal completely transformed how we deliver work. Our clients stopped emailing us for updates because everything is finally in one place." },
              { name: "Marcus Thorne", role: "Founder, Thorne Digital", text: "The AI project summaries alone save my project managers 10 hours a week. It's like having an extra employee." },
              { name: "Elena Rodriguez", role: "Director, Studio Creativo", text: "The white-labeled dashboard makes our boutique agency look like a Fortune 500 company. Best investment we've made." }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-slate-50 dark:bg-muted/30 rounded-3xl p-8 border border-border/50 shadow-sm"
              >
                <div className="flex gap-1 mb-6 text-yellow-500">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-lg mb-8 leading-relaxed font-medium text-foreground">"{t.text}"</p>
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section id="contact" className="py-40 relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900" />
        <div className="container relative mx-auto px-4 md:px-8 text-center max-w-4xl z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">Ready to modernize your agency?</h2>
            <p className="text-xl text-slate-300 mb-12 font-medium">
              Join innovative agencies using AgencyPortal AI to deliver a premium client experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "h-14 px-10 text-base rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 bg-indigo-500 hover:bg-indigo-600 text-white border-0")}>
                Create Your Workspace
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
