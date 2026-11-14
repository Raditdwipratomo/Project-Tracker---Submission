import { ChevronUp, KanbanSquare, Plus } from 'lucide-react'
import { STATUS_STYLES } from '../constants/taskStatus'

export function Header({ counts, isComposerOpen, onToggleComposer }) {
  const total = counts.All
  const completionRate = total > 0 ? Math.round((counts.Done / total) * 100) : 0
  const donePercent = total > 0 ? (counts.Done / total) * 100 : 0
  const inProgressPercent = total > 0 ? (counts['In Progress'] / total) * 100 : 0
  const todoPercent = total > 0 ? (counts.Todo / total) * 100 : 0

  return (
    <header className="border-b border-[#E4E7EC] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D4ED8] text-white shadow-sm">
              <KanbanSquare className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-balance text-xl font-semibold tracking-tight text-[#0F172A] sm:text-2xl">
                Project Tracker
              </h1>
              <p className="mt-0.5 text-pretty text-sm text-[#525866]">
                Plan work items, drag cards across stages, and track completion in real time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <div className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#334155] tabular-nums">
              <span>Completion</span>
              <span className="rounded bg-white px-1.5 py-0.5 font-semibold text-[#0F172A] shadow-2xs">
                {completionRate}%
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleComposer}
              aria-expanded={isComposerOpen}
              className="inline-flex touch-manipulation items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              {isComposerOpen ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isComposerOpen ? 'Hide composer' : 'New task'}</span>
            </button>
          </div>
        </div>

        <div
          className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full bg-[#EBEEF2]"
          role="img"
          aria-label={
            total > 0
              ? `${counts.Done} done, ${counts['In Progress']} in progress, ${counts.Todo} todo out of ${total} tasks`
              : 'No tasks recorded yet'
          }
        >
          {total > 0 ? (
            <>
              {counts.Done > 0 ? (
                <div
                  className={`${STATUS_STYLES.Done.bar} transition-[width] duration-300 motion-reduce:transition-none`}
                  style={{ width: `${donePercent}%` }}
                />
              ) : null}
              {counts['In Progress'] > 0 ? (
                <div
                  className={`${STATUS_STYLES['In Progress'].bar} transition-[width] duration-300 motion-reduce:transition-none`}
                  style={{ width: `${inProgressPercent}%` }}
                />
              ) : null}
              {counts.Todo > 0 ? (
                <div
                  className={`${STATUS_STYLES.Todo.bar} transition-[width] duration-300 motion-reduce:transition-none`}
                  style={{ width: `${todoPercent}%` }}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
