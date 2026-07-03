import { getClientById } from '@/app/actions/clients'
import { notFound } from 'next/navigation'
import { Building2, Mail, Phone, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function ClientDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const client = await getClientById(params.id)

  if (!client) {
    notFound()
  }

  const initials = client.name.substring(0, 2).toUpperCase()

  return (
    <div className="flex-1 space-y-8">
      {/* Back Button & Breadcrumbs */}
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/dashboard/clients" />} className="mb-4 -ml-3 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </div>

      {/* Client Header Card - Creative Styling */}
      <div className="relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl rounded-2xl">
            <AvatarImage src={`https://avatar.vercel.sh/${client.id}`} />
            <AvatarFallback className="text-3xl rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {client.company || client.name}
              </h1>
              <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="w-fit capitalize">
                {client.status}
              </Badge>
            </div>
            
            <p className="text-lg text-muted-foreground font-medium">
              {client.company ? client.name : 'Independent Client'}
            </p>

            <div className="flex flex-wrap gap-4 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md">
                <Mail className="h-4 w-4" />
                <span>{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md">
                  <Phone className="h-4 w-4" />
                  <span>{client.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md">
                <Calendar className="h-4 w-4" />
                <span>Added {new Date(client.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button>Edit Profile</Button>
            <Button variant="outline">Client Portal Link</Button>
          </div>
        </div>
      </div>

      {/* Detailed Tabs Layer */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-[400px] mb-6">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="space-y-4 outline-none">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 text-center border-dashed">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg">No active projects</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-4">
              Get started by creating a new project for this client to track tasks and milestones.
            </p>
            <Button variant="outline">Create Project</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="tickets" className="space-y-4 outline-none">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 text-center border-dashed">
            <h3 className="font-semibold text-lg">No support tickets</h3>
            <p className="text-muted-foreground text-sm mt-1">This client hasn&apos;t opened any support tickets yet.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="files" className="space-y-4 outline-none">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 text-center border-dashed">
            <h3 className="font-semibold text-lg">No shared files</h3>
            <p className="text-muted-foreground text-sm mt-1">Upload files here to share them securely with the client.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
