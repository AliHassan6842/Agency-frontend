'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core'
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { moveTaskAction } from '@/app/actions/tasks'
import { KanbanColumn } from './kanban-column'
import { KanbanTask } from './kanban-task'

type Task = {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  project_id: string
}

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' }
]

export function KanbanBoard({ initialTasks, readOnly = false }: { initialTasks: Task[], readOnly?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  // Keep local state in sync with server changes
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  // Real-time subscription to task updates
  useEffect(() => {
    if (!projectId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`project-${projectId}-tasks`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...(payload.new as Task) } : t))
          } else if (payload.eventType === 'INSERT') {
            setTasks(prev => {
              if (prev.some(t => t.id === payload.new.id)) return prev;
              return [payload.new as Task, ...prev];
            })
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id))
          }
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId)
        const overIndex = tasks.findIndex((t) => t.id === overId)

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks]
          newTasks[activeIndex].status = tasks[overIndex].status
          return arrayMove(newTasks, activeIndex, overIndex)
        }

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    // Dropping a task over a column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId)
        const newTasks = [...tasks]
        newTasks[activeIndex].status = overId as string
        return arrayMove(newTasks, activeIndex, activeIndex)
      })
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    
    // Find the task that was moved
    const task = tasks.find(t => t.id === activeId)
    if (!task) return

    // Fire server action to persist the status change
    try {
      await moveTaskAction(activeId, task.status)
    } catch (error) {
      console.error('Failed to save task move to DB', error)
      // Ideally revert state here on failure
    }
  }

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Realtime Status Indicator */}
      <div className="absolute top-0 right-4 flex items-center gap-1.5 z-10 bg-background/80 px-2 py-1 rounded-md text-xs font-medium border shadow-sm">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-muted-foreground">{isConnected ? 'Live' : 'Disconnected'}</span>
      </div>

      <div className="flex h-full w-full gap-4 overflow-x-auto pb-4 pt-8">
        <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasks.filter((task) => task.status === col.id)}
            readOnly={readOnly}
          />
        ))}

        <DragOverlay>
          {activeTask ? <KanbanTask task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
      </div>
    </div>
  )
}
