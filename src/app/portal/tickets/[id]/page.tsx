import { getTicketById, getTicketReplies } from '@/app/actions/tickets'
import { ClientTicketReplyForm } from '@/components/tickets/client-ticket-reply-form'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, MessageSquare, User } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function ClientTicketDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const [ticket, allReplies] = await Promise.all([
    getTicketById(params.id),
    getTicketReplies(params.id)
  ])

  if (!ticket) {
    notFound()
  }

  // Filter out internal replies so client never sees them
  const publicReplies = allReplies.filter(reply => !reply.is_internal)

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
      case 'pending': return <Badge variant="secondary">In Progress</Badge>
      case 'resolved': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Resolved</Badge>
      case 'closed': return <Badge variant="outline">Closed</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-6 h-full flex flex-col max-w-5xl mx-auto w-full">
      {/* Back Button */}
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/portal/tickets" />} className="mb-2 -ml-3 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>
      </div>

      {/* Ticket Header Area */}
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {ticket.title}
              </h1>
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {ticket.project && (
                <>
                  <span>Project: <Link href={`/portal/projects/${ticket.project_id}`} className="font-medium text-primary hover:underline">{ticket.project.name}</Link></span>
                  <span>•</span>
                </>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {ticket.description}
          </p>
        </div>
      </div>

      {/* Replies Thread */}
      <div className="space-y-6 flex-1">
        <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
          <MessageSquare className="h-5 w-5" />
          <h2>Conversation</h2>
        </div>

        <div className="space-y-6 pb-6">
          {publicReplies.length === 0 ? (
            <p className="text-muted-foreground text-sm italic text-center py-8">
              No replies yet.
            </p>
          ) : (
            publicReplies.map((reply) => (
              <div key={reply.id} className={`flex gap-4`}>
                <Avatar className="h-10 w-10 border shadow-sm shrink-0">
                  <AvatarImage src={reply.author?.avatar_url || ''} />
                  <AvatarFallback>{reply.author?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 rounded-xl p-4 shadow-sm border bg-card`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{reply.author?.full_name || 'Support'}</span>
                    <span className="text-xs text-muted-foreground" title={new Date(reply.created_at).toLocaleString()}>
                      {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Form Sticky Bottom */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl pb-6 pt-2 border-t mt-auto">
          <ClientTicketReplyForm ticketId={ticket.id} />
        </div>
      </div>
    </div>
  )
}
