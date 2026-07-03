'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/app/actions/messages'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'

type Message = {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
  author?: {
    id: string
    full_name: string
    avatar_url: string
    email: string
  }
}

export function ProjectChat({ projectId, initialMessages, currentUserId }: { projectId: string, initialMessages: Message[], currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [prevInitial, setPrevInitial] = useState(initialMessages)

  // Sync prop changes
  if (initialMessages !== prevInitial) {
    setPrevInitial(initialMessages)
    setMessages(initialMessages)
  }

  useEffect(() => {
    // Scroll to bottom on load and new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to new messages for this project
    const channel = supabase
      .channel(`project_messages_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          // Fetch the author details for the new message
          const { data: authorData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email')
            .eq('id', payload.new.user_id)
            .single()

          const newMsg: Message = {
            ...(payload.new as Message),
            author: authorData || undefined
          }

          setMessages((prev) => {
            // Avoid duplicates if we sent it ourselves
            if (prev.find(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    const content = newMessage
    setNewMessage('') // optimistic clear

    try {
      await sendMessage(projectId, content)
    } catch {
      alert('Failed to send message')
      setNewMessage(content) // revert
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-xl bg-card shadow-sm relative">
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 bg-background/80 px-2 py-1 rounded-md text-xs font-medium border shadow-sm">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-muted-foreground">{isConnected ? 'Live' : 'Connecting...'}</span>
      </div>

      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold text-lg">Project Chat</h3>
        <p className="text-sm text-muted-foreground">Real-time collaboration for this project.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === currentUserId
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={msg.author?.avatar_url || ''} />
                    <AvatarFallback>{msg.author?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {!isMe && <span className="text-xs text-muted-foreground mb-1 ml-1">{msg.author?.full_name}</span>}
                  <div 
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-muted rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="p-4 border-t bg-muted/30">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            placeholder="Type a message..." 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
