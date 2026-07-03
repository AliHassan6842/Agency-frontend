import { getTicketById, getTicketReplies } from '@/app/actions/tickets'
import { TicketReplyForm } from '@/components/tickets/ticket-reply-form'
import { TicketStatusSelect } from '@/components/tickets/ticket-status-select'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, MessageSquare, ShieldAlert, User } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function TicketDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const [ticket, replies] = await Promise.all([
    getTicketById(params.id),
    getTicketReplies(params.id)
  ])

  if (!ticket) {
    notFound()
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant="destructive">Urgent</Badge>
      case 'high': return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">High</Badge>
      case 'normal': return <Badge variant="secondary">Normal</Badge>
      case 'low': return <Badge variant="outline">Low</Badge>
      default: return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-6 h-full flex flex-col max-w-5xl mx-auto w-full">
      {/* Back Button */}
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/dashboard/tickets" />} className="mb-2 -ml-3 text-muted-foreground hover:text-foreground">
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
              {getPriorityBadge(ticket.priority)}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {ticket.client?.company || ticket.client?.name || ticket.author?.full_name}
                </span>
              </div>
              {ticket.project && (
                <>
                  <span>•</span>
                  <span>Project: <Link href={`/dashboard/projects/${ticket.project_id}`} className="font-medium text-primary hover:underline">{ticket.project.name}</Link></span>
                </>
              )}
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TicketStatusSelect ticketId={ticket.id} initialStatus={ticket.status} />
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
          {replies.length === 0 ? (
            <p className="text-muted-foreground text-sm italic text-center py-8">
              No replies yet.
            </p>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className={`flex gap-4 ${reply.is_internal ? 'opacity-90' : ''}`}>
                <Avatar className="h-10 w-10 border shadow-sm shrink-0">
                  <AvatarImage src={reply.author?.avatar_url || ''} />
                  <AvatarFallback>{reply.author?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 rounded-xl p-4 shadow-sm border ${
                  reply.is_internal 
                    ? 'bg-orange-500/5 border-orange-500/30' 
                    : 'bg-card'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{reply.author?.full_name || 'Unknown'}</span>
                      {reply.is_internal && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 gap-1 px-1.5">
                          <ShieldAlert className="h-3 w-3" /> Internal
                        </Badge>
                      )}
                    </div>
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
          <TicketReplyForm ticketId={ticket.id} />
        </div>
      </div>
    </div>
  )
}
