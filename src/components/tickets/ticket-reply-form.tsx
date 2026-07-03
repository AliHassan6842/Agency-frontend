'use client'

import { useState } from 'react'
import { addTicketReply } from '@/app/actions/tickets'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2, Send, ShieldAlert, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [isInternal, setIsInternal] = useState(false)
  const [content, setContent] = useState('')

  const handleGenerateDraft = async () => {
    setDrafting(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001') + '/api/ai/ticket-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ ticketId })
      })

      const data = await res.json()
      if (data.draft) {
        setContent(data.draft)
      }
    } catch (error) {
      console.error('Failed to generate draft', error)
      alert('Failed to generate AI draft')
    } finally {
      setDrafting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addTicketReply(ticketId, content, isInternal)
      setContent('')
    } catch {
      alert('Failed to send reply')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="font-semibold text-sm">Add Reply</h3>
        <div className="flex items-center space-x-2">
          <Switch id="internal" checked={isInternal} onCheckedChange={setIsInternal} />
          <Label htmlFor="internal" className="flex items-center gap-1.5 cursor-pointer text-xs">
            {isInternal ? (
              <span className="text-orange-500 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Internal Note (Hidden from client)
              </span>
            ) : (
              <span className="text-muted-foreground">Public Reply</span>
            )}
          </Label>
        </div>
      </div>
      
      <Textarea 
        name="content" 
        required 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isInternal ? "Type an internal note..." : "Type your reply to the client..."} 
        className={`min-h-[120px] ${isInternal ? 'bg-orange-500/5 border-orange-500/20 focus-visible:ring-orange-500/50' : ''}`} 
      />
      
      <div className="flex justify-between items-center pt-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleGenerateDraft} 
          disabled={drafting || loading}
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
        >
          {drafting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Auto-Draft Reply
        </Button>

        <Button type="submit" disabled={loading} variant={isInternal ? "secondary" : "default"} className={isInternal ? "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400" : ""}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {isInternal ? 'Add Internal Note' : 'Send Reply'}
        </Button>
      </div>
    </form>
  )
}
