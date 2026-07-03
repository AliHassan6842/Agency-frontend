'use client'

import { useState } from 'react'
import { addTicketReply } from '@/app/actions/tickets'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send } from 'lucide-react'

export function ClientTicketReplyForm({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      // Clients ALWAYS send public replies (isInternal = false)
      await addTicketReply(ticketId, formData.get('content') as string, false)
      e.currentTarget.reset()
    } catch {
      alert('Failed to send reply')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-xl border p-4 shadow-sm">
      <div className="pb-2 border-b">
        <h3 className="font-semibold text-sm">Reply to Ticket</h3>
      </div>
      
      <Textarea 
        name="content" 
        required 
        placeholder="Type your reply here..." 
        className="min-h-[120px]" 
      />
      
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Send Reply
        </Button>
      </div>
    </form>
  )
}
