'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar, Pencil, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function EditableMilestones({ initialMilestones, projectId }: { initialMilestones: any[], projectId: string }) {
  const [milestones, setMilestones] = useState(initialMilestones)

  const handleSave = (updatedMilestone: any) => {
    setMilestones(current => current.map(m => m.id === updatedMilestone.id ? updatedMilestone : m))
  }

  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg mt-4">
        No milestones tracked yet. Generate them with AI!
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      {milestones.map((milestone) => (
        <EditableMilestoneItem key={milestone.id} milestone={milestone} onSave={handleSave} />
      ))}
    </div>
  )
}

function EditableMilestoneItem({ milestone, onSave }: { milestone: any, onSave: (m: any) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(milestone.title)
  const [description, setDescription] = useState(milestone.description || '')
  const [status, setStatus] = useState(milestone.status)
  const [dueDate, setDueDate] = useState(milestone.due_date ? new Date(milestone.due_date).toISOString().split('T')[0] : '')
  const [saving, setSaving] = useState(false)

  const saveMilestone = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('milestones')
        .update({ title, description, status, due_date: dueDate || null })
        .eq('id', milestone.id)
        .select()
        .single()
      
      if (error) throw error
      onSave(data)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update milestone', error)
      alert('Failed to update milestone')
    } finally {
      setSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col p-4 rounded-lg border bg-card gap-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone Title" />
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} />
        <div className="flex gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={saveMilestone} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group relative">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      <div className="flex items-center justify-between pr-10">
        <h4 className="font-medium text-sm">{milestone.title}</h4>
        <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
          {milestone.status}
        </Badge>
      </div>
      {milestone.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 pr-10">
          {milestone.description}
        </p>
      )}
      <div className="flex items-center gap-1 mt-3 text-xs font-medium text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
