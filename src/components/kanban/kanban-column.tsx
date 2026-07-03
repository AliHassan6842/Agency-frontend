'use client'

import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { KanbanTask } from './kanban-task'

type Column = {
  id: string
  title: string
}

type Task = {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  project_id: string
}

export function KanbanColumn({ column, tasks, readOnly = false }: { column: Column, tasks: Task[], readOnly?: boolean }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'Column', column }
  })

  return (
    <div 
      ref={setNodeRef}
      className="flex flex-col flex-shrink-0 w-80 bg-muted/40 rounded-xl border p-3 min-h-[500px]"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-semibold text-sm tracking-tight">{column.title}</h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanTask key={task.id} task={task} readOnly={readOnly} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
