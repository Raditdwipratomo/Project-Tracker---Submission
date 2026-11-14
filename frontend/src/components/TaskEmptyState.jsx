import { ClipboardList, FilterX, Plus } from 'lucide-react'

export function TaskEmptyState({
  totalTaskCount,
  activeFilter,
  hasSearchQuery,
  onResetFilters,
  onOpenComposer,
}) {
  const isDatabaseEmpty = totalTaskCount === 0
  const heading = isDatabaseEmpty
    ? 'No tasks yet'
    : hasSearchQuery
      ? 'No matching tasks'
      : `No ${activeFilter} tasks`

  const description = isDatabaseEmpty
    ? 'Add your first task above to start planning and tracking progress.'
    : hasSearchQuery
      ? 'Try a different keyword or reset active filters to inspect all items.'
      : 'Pick another stage or show all tasks to review existing work.'

  return (
    <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white px-6 py-12 text-center shadow-2xs">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569]">
        {isDatabaseEmpty ? (
          <ClipboardList className="h-6 w-6" aria-hidden="true" />
        ) : (
          <FilterX className="h-6 w-6" aria-hidden="true" />
        )}
      </div>
      <h2 className="mt-4 text-balance text-base font-semibold text-[#0F172A]">{heading}</h2>
      <p className="mx-auto mt-1 max-w-md text-pretty text-sm text-[#525866]">{description}</p>

      {isDatabaseEmpty && onOpenComposer ? (
        <button
          type="button"
          onClick={onOpenComposer}
          className="mt-5 inline-flex touch-manipulation items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white shadow-2xs transition-colors hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Create first task</span>
        </button>
      ) : null}

      {!isDatabaseEmpty && onResetFilters ? (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-5 inline-flex touch-manipulation items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          Show all tasks
        </button>
      ) : null}
    </div>
  )
}
