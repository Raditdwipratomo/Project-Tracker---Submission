import { useEffect, useRef, useState } from 'react'
import { ChevronUp, Loader2, Plus, Sparkles } from 'lucide-react'
import { STATUS_STYLES, TASK_STATUSES } from '../constants/taskStatus'

export function TaskForm({
  onCreateTask,
  isSubmitting,
  defaultStatus = 'Todo',
  focusSignal = 0,
  onCollapse,
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState(defaultStatus)
  const [titleError, setTitleError] = useState('')
  const titleInputRef = useRef(null)

  useEffect(() => {
    if (focusSignal > 0) {
      setStatus(defaultStatus)
      titleInputRef.current?.focus()
    }
  }, [focusSignal, defaultStatus])

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('Enter a task title before adding.')
      titleInputRef.current?.focus()
      return
    }

    setTitleError('')
    const trimmedDescription = description.trim()

    const succeeded = await onCreateTask({
      title: trimmedTitle,
      description: trimmedDescription ? trimmedDescription : null,
      status,
    })

    if (succeeded) {
      setTitle('')
      setDescription('')
      setStatus(defaultStatus)
    }
  }

  function handleTitleChange(event) {
    const nextValue = event.target.value
    setTitle(nextValue)
    if (titleError && nextValue.trim()) {
      setTitleError('')
    }
  }

  return (
    <section
      aria-labelledby="create-task-heading"
      className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-2xs sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1D4ED8]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h2 id="create-task-heading" className="text-balance text-base font-semibold text-[#0F172A]">
              Quick Add Task
            </h2>
            <p className="text-pretty text-xs text-[#525866] sm:text-sm">
              Capture a work item, pick its starting column, and track it immediately.
            </p>
          </div>
        </div>

        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Hide composer"
            className="inline-flex touch-manipulation items-center gap-1 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-medium text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 motion-reduce:transition-none"
          >
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Hide</span>
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between">
              <label htmlFor="task-title" className="block text-sm font-medium text-[#0F172A]">
                Title <span className="text-[#DC2626]" aria-hidden="true">*</span>
              </label>
              {title.length > 0 ? (
                <span className="text-xs text-[#64748B] tabular-nums">
                  {title.length}/255
                </span>
              ) : null}
            </div>
            <input
              ref={titleInputRef}
              id="task-title"
              name="title"
              type="text"
              autoComplete="off"
              maxLength={255}
              required
              value={title}
              onChange={handleTitleChange}
              disabled={isSubmitting}
              placeholder="e.g., Design API endpoints or review PR…"
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? 'task-title-error' : undefined}
              className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#64748B] ${
                titleError ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
              }`}
            />
            {titleError ? (
              <p id="task-title-error" role="alert" className="mt-1.5 text-xs font-medium text-[#DC2626]">
                {titleError}
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-5">
            <span id="task-status-label" className="block text-sm font-medium text-[#0F172A]">
              Starting stage
            </span>
            <div
              role="radiogroup"
              aria-labelledby="task-status-label"
              className="mt-1.5 flex flex-wrap gap-1.5 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-1 sm:grid sm:grid-cols-3"
            >
              {TASK_STATUSES.map((option) => {
                const isSelected = status === option
                const styles = STATUS_STYLES[option]

                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSubmitting}
                    onClick={() => setStatus(option)}
                    className={`inline-flex flex-1 touch-manipulation items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:flex-initial sm:px-2 sm:text-sm ${
                      isSelected
                        ? styles.pillActive
                        : 'border-transparent bg-transparent text-[#475569] hover:bg-white hover:text-[#0F172A]'
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
                    <span>{option}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <label htmlFor="task-description" className="block text-sm font-medium text-[#0F172A]">
              Description <span className="font-normal text-[#64748B]">(optional)</span>
            </label>
            <textarea
              id="task-description"
              name="description"
              autoComplete="off"
              rows={2}
              maxLength={5000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              placeholder="Add acceptance notes, links, or blockers…"
              className="mt-1.5 block w-full resize-y rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#64748B]"
            />
          </div>

          <div className="flex justify-end lg:col-span-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#93C5FD] motion-reduce:transition-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  <span>Adding…</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Add task</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}
