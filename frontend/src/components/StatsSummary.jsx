import { CheckCircle2, CircleDot, Clock, Layers } from 'lucide-react'

const METRICS = [
  {
    key: 'All',
    label: 'Total Tasks',
    icon: Layers,
    iconBg: 'bg-[#EFF6FF] text-[#1D4ED8]',
    activeRing: 'border-[#1D4ED8] ring-1 ring-[#1D4ED8]/20 bg-[#F8FAFF]',
  },
  {
    key: 'Todo',
    label: 'To Do',
    icon: CircleDot,
    iconBg: 'bg-[#F1F5F9] text-[#475569]',
    activeRing: 'border-[#64748B] ring-1 ring-[#64748B]/20 bg-[#F8FAFC]',
  },
  {
    key: 'In Progress',
    label: 'In Progress',
    icon: Clock,
    iconBg: 'bg-[#FEF3C7] text-[#D97706]',
    activeRing: 'border-[#D97706] ring-1 ring-[#D97706]/20 bg-[#FFFDF5]',
  },
  {
    key: 'Done',
    label: 'Completed',
    icon: CheckCircle2,
    iconBg: 'bg-[#DCFCE7] text-[#16A34A]',
    activeRing: 'border-[#16A34A] ring-1 ring-[#16A34A]/20 bg-[#F4FDF7]',
  },
]

export function StatsSummary({ counts, activeFilter, onFilterSelect }) {
  return (
    <section aria-label="Task summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {METRICS.map((metric) => {
        const Icon = metric.icon
        const value = counts[metric.key] ?? 0
        const isSelected = activeFilter === metric.key

        return (
          <button
            key={metric.key}
            type="button"
            onClick={() => onFilterSelect(metric.key)}
            aria-pressed={isSelected}
            className={`group flex touch-manipulation items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 motion-reduce:transition-none ${
              isSelected
                ? metric.activeRing
                : 'border-[#E4E7EC] bg-white hover:border-[#CBD5E1] hover:bg-[#FAFBFD]'
            }`}
          >
            <div>
              <p className="text-xs font-medium text-[#525866]">{metric.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#0F172A] tabular-nums">
                {value}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${metric.iconBg}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </button>
        )
      })}
    </section>
  )
}
