import { CheckCircle2, Info, RotateCcw, X } from 'lucide-react'

export function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#0F172A] px-4 py-3 text-sm text-white shadow-lg"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {toast.tone === 'info' ? (
              <Info className="h-4 w-4 shrink-0 text-[#60A5FA]" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4ADE80]" aria-hidden="true" />
            )}
            <span className="truncate font-medium">{toast.message}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {toast.onUndo ? (
              <button
                type="button"
                onClick={() => {
                  toast.onUndo()
                  onDismiss(toast.id)
                }}
                className="inline-flex touch-manipulation items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Undo</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="touch-manipulation rounded-md p-1 text-[#94A3B8] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
