import { memo, useState } from 'react'
import {
  ArrowRight,
  GripVertical,
  Loader2,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { NEXT_STATUS_MAP, STATUS_STYLES, TASK_STATUSES } from '../constants/taskStatus'
import { formatTimestamp } from '../utils/dateFormat'

function TaskCardInner({
  task,
  variant = 'list',
  isPending,
  onStatusChange,
  onEditClick,
  onDeleteClick,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const styles = STATUS_STYLES[task.status] ?? STATUS_STYLES.Todo
  const nextStatus = NEXT_STATUS_MAP[task.status] ?? 'Todo'
  const isBoard = variant === 'board'
  const statusSelectId = `status-select-${task.id}`

  function handleDragStart(event) {
    if (isPending) {
      event.preventDefault()
      return
    }
    event.dataTransfer.setData('text/plain', String(task.id))
    event.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
  }

  function handleDragEnd() {
    setIsDragging(false)
  }

  return (
    <article
      draggable={!isPending}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group rounded-xl border border-[#E4E7EC] border-l-4 bg-white transition-[border-color,box-shadow,opacity] hover:border-[#CBD5E1] hover:shadow-sm motion-reduce:transition-none ${
        styles.accentBorder
      } ${isBoard ? 'p-4' : 'p-4 sm:p-5'} ${
        isPending ? 'opacity-70' : isDragging ? 'opacity-50 ring-2 ring-[#1D4ED8]/40' : ''
      }`}
    >
      <div className={isBoard ? 'flex flex-col gap-3' : 'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {isBoard ? (
                <GripVertical
                  className="-ml-1 h-3.5 w-3.5 shrink-0 cursor-grab text-[#94A3B8] opacity-75 group-hover:opacity-100 active:cursor-grabbing"
                  aria-hidden="true"
                />
              ) : null}

              <span
                translate="no"
                className="rounded bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-xs font-medium text-[#64748B]"
              >
                #{task.id}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${styles.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
                {task.status}
              </span>
            </div>

            {isPending ? (
              <span
                className="inline-flex items-center gap-1 text-xs text-[#64748B]"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Saving…
              </span>
            ) : isBoard ? (
              <span className="text-[11px] text-[#64748B] tabular-nums">
                {formatTimestamp(task.created_at)}
              </span>
            ) : null}
          </div>

          <h3 className="mt-2.5 text-base font-semibold leading-snug text-[#0F172A]">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onEditClick(task)}
              className="break-words text-left transition-colors hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 disabled:cursor-not-allowed"
            >
              {task.title}
            </button>
          </h3>

          {task.description ? (
            <p
              className={`mt-1.5 break-words text-sm leading-relaxed text-[#475569] ${
                isBoard ? 'line-clamp-3 whitespace-pre-line' : 'whitespace-pre-line'
              }`}
            >
              {task.description}
            </p>
          ) : (
            <p className="mt-1.5 text-xs italic text-[#94A3B8]">No description</p>
          )}

          {!isBoard ? (
            <p className="mt-2.5 text-xs text-[#64748B] tabular-nums">
              Created {formatTimestamp(task.created_at)}
            </p>
          ) : null}
        </div>

        <div
          className={
            isBoard
              ? 'flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F5F9] pt-3'
              : 'flex flex-wrap items-center gap-2 sm:shrink-0 sm:flex-col sm:items-end'
          }
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <label htmlFor={statusSelectId} className="sr-only">
              Status for {task.title}
            </label>
            <select
              id={statusSelectId}
              aria-label={`Status for ${task.title}`}
              value={task.status}
              disabled={isPending}
              onChange={(event) => onStatusChange(task.id, event.target.value)}
              className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#64748B]"
            >
              {TASK_STATUSES.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={isPending}
              onClick={() => onStatusChange(task.id, nextStatus)}
              aria-label={`Move ${task.title} to ${nextStatus}`}
              title={`Move to ${nextStatus}`}
              className="inline-flex touch-manipulation items-center gap-1 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] px-2 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#CBD5E1] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            >
              {task.status === 'Done' ? (
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
              ) : (
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              )}
              <span>{task.status === 'Done' ? 'Reopen' : nextStatus}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onEditClick(task)}
              aria-label={`Edit ${task.title}`}
              className="inline-flex touch-manipulation items-center gap-1 rounded-lg border border-[#E4E7EC] bg-white px-2.5 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              {!isBoard ? <span>Edit</span> : null}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => onDeleteClick(task)}
              aria-label={`Delete ${task.title}`}
              className="inline-flex touch-manipulation items-center gap-1 rounded-lg border border-[#FECACA] bg-white px-2.5 py-1.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              {!isBoard ? <span>Delete</span> : null}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export const TaskCard = memo(TaskCardInner)
