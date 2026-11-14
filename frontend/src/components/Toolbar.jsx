import { ArrowUpDown, LayoutGrid, List, Search, X } from 'lucide-react'
import { SORT_OPTIONS } from '../constants/taskStatus'
import { FilterBar } from './FilterBar'

export function Toolbar({
  activeFilter,
  counts,
  onFilterChange,
  searchQuery,
  onSearchChange,
  searchInputRef,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}) {
  return (
    <section aria-label="Task controls" className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterBar
          activeFilter={activeFilter}
          counts={counts}
          onFilterChange={onFilterChange}
        />

        <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
          <div className="relative min-w-0 flex-1 sm:w-60 sm:flex-initial">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search tasks… (/)"
              aria-label="Search tasks"
              autoComplete="off"
              className="w-full rounded-lg border border-[#E4E7EC] bg-white py-2 pr-8 pl-9 text-sm text-[#0F172A] shadow-2xs placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('')
                  searchInputRef?.current?.focus()
                }}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 touch-manipulation rounded p-0.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] bg-white px-2.5 py-1.5 shadow-2xs">
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-[#64748B]" aria-hidden="true" />
            <label htmlFor="sort-tasks" className="sr-only">
              Sort tasks
            </label>
            <select
              id="sort-tasks"
              aria-label="Sort tasks"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
              className="bg-transparent pr-1 text-xs font-medium text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] sm:text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div
            role="group"
            aria-label="Workspace view"
            className="inline-flex items-center rounded-lg border border-[#E4E7EC] bg-white p-0.5 shadow-2xs"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('board')}
              aria-pressed={viewMode === 'board'}
              className={`inline-flex touch-manipulation items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] motion-reduce:transition-none sm:text-sm ${
                viewMode === 'board'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-pressed={viewMode === 'list'}
              className={`inline-flex touch-manipulation items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] motion-reduce:transition-none sm:text-sm ${
                viewMode === 'list'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
