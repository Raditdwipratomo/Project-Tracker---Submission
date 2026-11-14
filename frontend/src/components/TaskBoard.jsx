import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { STATUS_STYLES, TASK_STATUSES } from '../constants/taskStatus'
import { TaskCard } from './TaskCard'
import { TaskEmptyState } from './TaskEmptyState'

function BoardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading tasks"
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      {[1, 2, 3].map((col) => (
        <div
          key={col}
          className="rounded-xl border border-[#E4E7EC] bg-white/70 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 animate-pulse rounded bg-[#E2E8F0] motion-reduce:animate-none" />
            <div className="h-5 w-7 animate-pulse rounded-full bg-[#E2E8F0] motion-reduce:animate-none" />
          </div>
          <div className="mt-4 space-y-3">
            {[1, 2].map((card) => (
              <div
                key={card}
                className="rounded-xl border border-[#E4E7EC] bg-white p-4"
              >
                <div className="h-4 w-20 animate-pulse rounded bg-[#F1F5F9] motion-reduce:animate-none" />
                <div className="mt-3 h-5 w-4/5 animate-pulse rounded bg-[#E2E8F0] motion-reduce:animate-none" />
                <div className="mt-2 h-4 w-3/5 animate-pulse rounded bg-[#F1F5F9] motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TaskBoard({
  tasks,
  totalTaskCount,
  activeFilter,
  hasSearchQuery,
  isLoading,
  pendingTaskIds,
  onStatusChange,
  onMoveTask,
  onEditClick,
  onDeleteClick,
  onQuickAddInColumn,
  onResetFilters,
  onOpenComposer,
}) {
  const [dragOverColumn, setDragOverColumn] = useState(null)

  const tasksByStatus = useMemo(() => {
    const grouped = {
      Todo: [],
      'In Progress': [],
      Done: [],
    }
    for (const task of tasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    }
    return grouped
  }, [tasks])

  if (isLoading) {
    return <BoardSkeleton />
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

  const visibleColumns = activeFilter === 'All' ? TASK_STATUSES : [activeFilter]

  function handleDragOver(event, columnStatus) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus)
    }
  }

  function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDragOverColumn(null)
    }
  }

  function handleDrop(event, columnStatus) {
    event.preventDefault()
    setDragOverColumn(null)
    const rawId = event.dataTransfer.getData('text/plain')
    const parsedId = Number(rawId)
    if (!Number.isInteger(parsedId) || parsedId <= 0) return
    onMoveTask(parsedId, columnStatus)
  }

  return (
    <div
      className={
        visibleColumns.length === 1
          ? 'grid grid-cols-1 gap-4'
          : 'grid grid-cols-1 gap-4 lg:grid-cols-3'
      }
    >
      {visibleColumns.map((columnStatus) => {
        const columnTasks = tasksByStatus[columnStatus] ?? []
        const styles = STATUS_STYLES[columnStatus] ?? STATUS_STYLES.Todo
        const isDropActive = dragOverColumn === columnStatus

        return (
          <section
            key={columnStatus}
            aria-label={`${columnStatus} column`}
            onDragOver={(event) => handleDragOver(event, columnStatus)}
            onDragLeave={handleDragLeave}
            onDrop={(event) => handleDrop(event, columnStatus)}
            className={`flex min-h-[16rem] flex-col rounded-xl border p-3.5 transition-[background-color,border-color,box-shadow] motion-reduce:transition-none sm:p-4 ${
              isDropActive
                ? 'border-[#1D4ED8] bg-[#EFF6FF]/70 ring-2 ring-[#1D4ED8]/25'
                : styles.columnBg
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} aria-hidden="true" />
                <h2 className={`text-sm font-semibold ${styles.columnHeader}`}>
                  {columnStatus}
                </h2>
                <span className="inline-flex min-w-[1.4rem] items-center justify-center rounded-full bg-white/90 px-1.5 py-0.5 text-xs font-medium text-[#334155] shadow-2xs tabular-nums">
                  {columnTasks.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onQuickAddInColumn(columnStatus)}
                aria-label={`Quick add to ${columnStatus}`}
                className="inline-flex touch-manipulation items-center gap-1 rounded-lg bg-white/85 px-2 py-1 text-xs font-medium text-[#334155] shadow-2xs transition-colors hover:bg-white hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] motion-reduce:transition-none"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add</span>
              </button>
            </div>

            {columnTasks.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] bg-white/55 px-4 py-8 text-center">
                <p className="text-xs font-medium text-[#64748B]">
                  {isDropActive ? `Drop here to move to ${columnStatus}` : `No ${columnStatus} cards`}
                </p>
                <p className="mt-1 text-[11px] text-[#94A3B8]">
                  Drag a card here or click + Add
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {columnTasks.map((task) => (
                  <li key={task.id}>
                    <TaskCard
                      task={task}
                      variant="board"
                      isPending={pendingTaskIds.has(task.id)}
                      onStatusChange={onStatusChange}
                      onEditClick={onEditClick}
                      onDeleteClick={onDeleteClick}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
