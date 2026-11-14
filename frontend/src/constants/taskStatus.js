export const TASK_STATUSES = ['Todo', 'In Progress', 'Done']

export const FILTER_OPTIONS = ['All', ...TASK_STATUSES]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title (A–Z)' },
]

export const NEXT_STATUS_MAP = {
  Todo: 'In Progress',
  'In Progress': 'Done',
  Done: 'Todo',
}

export const STATUS_STYLES = {
  Todo: {
    badge: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]',
    dot: 'bg-[#64748B]',
    accentBorder: 'border-l-[#94A3B8]',
    bar: 'bg-[#94A3B8]',
    columnBg: 'bg-[#F8FAFC]/80 border-[#E2E8F0]',
    columnHeader: 'text-[#334155]',
    pillActive: 'bg-[#F1F5F9] text-[#0F172A] border-[#64748B] ring-1 ring-[#64748B]',
  },
  'In Progress': {
    badge: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
    dot: 'bg-[#D97706]',
    accentBorder: 'border-l-[#F59E0B]',
    bar: 'bg-[#F59E0B]',
    columnBg: 'bg-[#FFFBEB]/45 border-[#FDE68A]/70',
    columnHeader: 'text-[#92400E]',
    pillActive: 'bg-[#FEF3C7] text-[#92400E] border-[#D97706] ring-1 ring-[#D97706]',
  },
  Done: {
    badge: 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]',
    dot: 'bg-[#16A34A]',
    accentBorder: 'border-l-[#16A34A]',
    bar: 'bg-[#16A34A]',
    columnBg: 'bg-[#F0FDF4]/55 border-[#BBF7D0]/80',
    columnHeader: 'text-[#166534]',
    pillActive: 'bg-[#DCFCE7] text-[#166534] border-[#16A34A] ring-1 ring-[#16A34A]',
  },
}
