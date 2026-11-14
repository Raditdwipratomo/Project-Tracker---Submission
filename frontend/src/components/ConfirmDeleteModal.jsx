import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

export function ConfirmDeleteModal({ task, isDeleting, onCancel, onConfirm }) {
  const [submitError, setSubmitError] = useState('')
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    cancelButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDeleting, onCancel])

  async function handleConfirm() {
    if (isDeleting) return
    setSubmitError('')
    const errorMessage = await onConfirm(task.id)
    if (errorMessage) {
      setSubmitError(errorMessage)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-[#111827]/45 p-4 backdrop-blur-[1px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-task-title"
      aria-describedby="delete-task-description"
      onClick={() => {
        if (!isDeleting) onCancel()
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[#E2E5EA] bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 id="delete-task-title" className="text-balance text-base font-semibold text-[#111827]">
              Delete task <span translate="no" className="font-mono text-sm">#{task.id}</span>?
            </h2>
            <p id="delete-task-description" className="mt-1.5 break-words text-pretty text-sm text-[#525866]">
              This permanently removes <span className="font-medium text-[#111827]">“{task.title}”</span> from the board. This action cannot be undone.
            </p>
          </div>
        </div>

        {submitError ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#991B1B]"
          >
            {submitError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="inline-flex touch-manipulation items-center justify-center rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="inline-flex touch-manipulation items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                <span>Deleting…</span>
              </>
            ) : (
              <span>Delete task</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
