import { TaskCard } from './TaskCard'
import { TaskEmptyState } from './TaskEmptyState'

function LoadingSkeleton() {
  return (
    <div role="status" aria-label="Loading tasks" className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-[#E4E7EC] bg-white p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-5 w-12 animate-pulse rounded bg-[#E2E8F0] motion-reduce:animate-none" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-[#E2E8F0] motion-reduce:animate-none" />
          </div>
          <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-[#E2E8F0] motion-reduce:animate-none" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#F1F5F9] motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  )
}

export function TaskList({
  tasks,
  totalTaskCount,
  activeFilter,
  hasSearchQuery,
  isLoading,
  pendingTaskIds,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onResetFilters,
  onOpenComposer,
}) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (totalTaskCount === 0 || tasks.length === 0) {
    return (
      <TaskEmptyState
        totalTaskCount={totalTaskCount}
        activeFilter={activeFilter}
        hasSearchQuery={hasSearchQuery}
        onResetFilters={onResetFilters}
        onOpenComposer={onOpenComposer}
      />
    )
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard
            task={task}
            variant="list"
            isPending={pendingTaskIds.has(task.id)}
            onStatusChange={onStatusChange}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
          />
        </li>
      ))}
    </ul>
  )
}
