import { Bot } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/10">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-bold tracking-tight">AgencyPortal AI</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AgencyPortal AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
