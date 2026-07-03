import { getTasks } from '@/app/actions/tasks'
import { KanbanBoard } from '@/components/kanban/kanban-board'

export const metadata = {
  title: 'Tasks | Agency Portal',
}

export default async function TasksPage() {
  const tasks = await getTasks()

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <div className="flex items-center justify-between mb-4 flex-none">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage and track your project tasks.</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard initialTasks={tasks} />
      </div>
    </div>
  )
}
