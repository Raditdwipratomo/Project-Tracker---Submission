import { useEffect, useRef, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { STATUS_STYLES, TASK_STATUSES } from '../constants/taskStatus'
import { formatTimestamp } from '../utils/dateFormat'

export function EditTaskModal({ task, isSaving, onClose, onSave }) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [status, setStatus] = useState(task.status)
  const [titleError, setTitleError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const titleInputRef = useRef(null)

  useEffect(() => {
    titleInputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isSaving) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSaving, onClose])

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSaving) return

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('Enter a task title before saving.')
      titleInputRef.current?.focus()
      return
    }

    setTitleError('')
    setSubmitError('')
    const trimmedDescription = description.trim()

    const errorMessage = await onSave(task.id, {
      title: trimmedTitle,
      description: trimmedDescription ? trimmedDescription : null,
      status,
    })
    if (errorMessage) {
      setSubmitError(errorMessage)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-[#0F172A]/45 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-modal-title"
      onClick={() => {
        if (!isSaving) onClose()
      }}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[#E4E7EC] bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-task-modal-title" className="text-balance text-lg font-semibold text-[#0F172A]">
              Edit task <span translate="no" className="font-mono text-sm text-[#64748B]">#{task.id}</span>
            </h2>
            <p className="mt-1 text-pretty text-sm text-[#525866]">
              Refine details, add notes, or move this item to another stage.
            </p>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close edit dialog"
            className="touch-manipulation rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="edit-task-title" className="block text-sm font-medium text-[#0F172A]">
                Title <span className="text-[#DC2626]" aria-hidden="true">*</span>
              </label>
              <span className="text-xs text-[#64748B] tabular-nums">
                {title.length}/255
              </span>
            </div>
            <input
              ref={titleInputRef}
              id="edit-task-title"
              name="title"
              type="text"
              autoComplete="off"
              maxLength={255}
              required
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                if (titleError && event.target.value.trim()) {
                  setTitleError('')
                }
              }}
              disabled={isSaving}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? 'edit-task-title-error' : undefined}
              className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] ${
                titleError ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
              }`}
            />
            {titleError ? (
              <p id="edit-task-title-error" role="alert" className="mt-1.5 text-xs font-medium text-[#DC2626]">
                {titleError}
              </p>
            ) : null}
          </div>

          <div>
            <span id="edit-task-status-label" className="block text-sm font-medium text-[#0F172A]">
              Status
            </span>
            <div
              role="radiogroup"
              aria-labelledby="edit-task-status-label"
              className="mt-1.5 flex flex-wrap gap-1.5 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-1 sm:grid sm:grid-cols-3 sm:gap-2"
            >
              {TASK_STATUSES.map((statusOption) => {
                const isSelected = status === statusOption
                const styles = STATUS_STYLES[statusOption]

                return (
                  <button
                    key={statusOption}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSaving}
                    onClick={() => setStatus(statusOption)}
                    className={`inline-flex flex-1 touch-manipulation items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:flex-initial sm:text-sm ${
                      isSelected
                        ? styles.pillActive
                        : 'border-transparent bg-transparent text-[#475569] hover:bg-white hover:text-[#0F172A]'
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
                    <span>{statusOption}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label htmlFor="edit-task-description" className="block text-sm font-medium text-[#0F172A]">
              Description <span className="font-normal text-[#64748B]">(optional)</span>
            </label>
            <textarea
              id="edit-task-description"
              name="description"
              autoComplete="off"
              rows={4}
              maxLength={5000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSaving}
              placeholder="Add extra context or details…"
              className="mt-1.5 block w-full resize-y rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B] tabular-nums">
            <span>Created {formatTimestamp(task.created_at)}</span>
            <span>Updated {formatTimestamp(task.updated_at)}</span>
          </div>

          {submitError ? (
            <p
              role="alert"
              className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#991B1B]"
            >
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="inline-flex touch-manipulation items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex touch-manipulation items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  <span>Saving…</span>
                </>
              ) : (
                <span>Save changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
