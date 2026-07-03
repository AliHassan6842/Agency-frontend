'use client'

import { useState, useEffect } from 'react'
import { updateTicketStatus } from '@/app/actions/tickets'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export function TicketStatusSelect({ ticketId, initialStatus }: { ticketId: string, initialStatus: string }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(initialStatus)

  // Sync if the server prop changes
  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const handleStatusChange = async (value: string | null) => {
    if (!value) return
    setStatus(value)
    setLoading(true)
    try {
      await updateTicketStatus(ticketId, value)
    } catch {
      setStatus(initialStatus)
      alert('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Status:</span>
      <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="open">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 scale-75 origin-left">Open</Badge>
            </div>
          </SelectItem>
          <SelectItem value="pending">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="scale-75 origin-left">Pending</Badge>
            </div>
          </SelectItem>
          <SelectItem value="resolved">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 scale-75 origin-left">Resolved</Badge>
            </div>
          </SelectItem>
          <SelectItem value="closed">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="scale-75 origin-left">Closed</Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
