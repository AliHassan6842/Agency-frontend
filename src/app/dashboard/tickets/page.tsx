import { getTickets } from '@/app/actions/tickets'
import { CreateTicketDialog } from '@/components/tickets/create-ticket-dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Ticket, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function TicketsPage() {
  const tickets = await getTickets()

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant="destructive">Urgent</Badge>
      case 'high': return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">High</Badge>
      case 'normal': return <Badge variant="secondary">Normal</Badge>
      case 'low': return <Badge variant="outline">Low</Badge>
      default: return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Open</Badge>
      case 'pending': return <Badge variant="secondary">Pending</Badge>
      case 'resolved': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Resolved</Badge>
      case 'closed': return <Badge variant="outline">Closed</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-muted-foreground">Manage client requests, bugs, and inquiries.</p>
        </div>
        <CreateTicketDialog />
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 rounded-xl border border-dashed p-12 text-center bg-card">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Ticket className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No active tickets</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
            Clients haven&apos;t submitted any support requests yet. When they do, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{ticket.title}</span>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-3xl">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4" />
                          <span>{ticket.client?.company || ticket.client?.name || ticket.author?.full_name || 'Unknown'}</span>
                        </div>
                        {ticket.project && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground">{ticket.project.name}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
