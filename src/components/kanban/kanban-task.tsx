'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Task = {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  project_id: string
  client_visible?: boolean
}

export function KanbanTask({ task, isOverlay = false, readOnly = false }: { task: Task, isOverlay?: boolean, readOnly?: boolean }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
    disabled: readOnly
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    medium: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-600 border-red-500/20',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm transition-opacity ${
        isDragging ? 'opacity-30' : ''
      } ${isOverlay ? 'scale-105 shadow-xl cursor-grabbing' : readOnly ? 'cursor-default' : 'cursor-grab hover:border-primary/50'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          {task.client_visible && (
            <span title="Visible to Client"><Eye className="h-3.5 w-3.5 text-blue-500 shrink-0" /></span>
          )}
          <h4 className="text-sm font-medium leading-none line-clamp-2">{task.title}</h4>
        </div>
        {!readOnly && (
          <div 
            {...attributes} 
            {...listeners}
            className="text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing p-1 -mr-2 -mt-2 rounded"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
      </div>
      
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <Badge variant="outline" className={`text-[10px] uppercase px-1.5 py-0 ${priorityColors[task.priority] || priorityColors.medium}`}>
          {task.priority}
        </Badge>
        <div className="h-5 w-5 rounded-full bg-secondary border text-[9px] flex items-center justify-center font-bold text-muted-foreground">
          U
        </div>
      </div>
    </div>
  )
}
