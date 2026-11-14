import { FILTER_OPTIONS } from '../constants/taskStatus'

export function FilterBar({ activeFilter, counts, onFilterChange }) {
  return (
    <div
      role="tablist"
      aria-label="Filter tasks by status"
      className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E4E7EC] bg-white p-1 shadow-2xs sm:gap-1.5"
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option
        const count = counts[option] ?? 0

        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onFilterChange(option)}
            className={`inline-flex touch-manipulation items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 sm:px-3 sm:text-sm motion-reduce:transition-none ${
              isActive
                ? 'bg-[#1D4ED8] text-white shadow-2xs'
                : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
            }`}
          >
            <span>{option}</span>
            <span
              className={`inline-flex min-w-[1.35rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#334155]'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
