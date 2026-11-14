import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal'
import { EditTaskModal } from './components/EditTaskModal'
import { Header } from './components/Header'
import { StatsSummary } from './components/StatsSummary'
import { TaskBoard } from './components/TaskBoard'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { ToastContainer } from './components/ToastContainer'
import { Toolbar } from './components/Toolbar'
import { FILTER_OPTIONS } from './constants/taskStatus'
import {
  createTask,
  deleteTask,
  fetchTasks,
  getApiErrorMessage,
  updateTask,
} from './services/taskApi'

const VIEW_MODES = ['board', 'list']

function readInitialUrlState() {
  if (typeof window === 'undefined') {
    return { status: 'All', view: 'board' }
  }
  const params = new URLSearchParams(window.location.search)
  const rawStatus = params.get('status')
  const rawView = params.get('view')

  return {
    status: rawStatus && FILTER_OPTIONS.includes(rawStatus) ? rawStatus : 'All',
    view: rawView && VIEW_MODES.includes(rawView) ? rawView : 'board',
  }
}

function syncUrlParams(status, view) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)

  if (status === 'All') {
    params.delete('status')
  } else {
    params.set('status', status)
  }

  if (view === 'board') {
    params.delete('view')
  } else {
    params.set('view', view)
  }

  const query = params.toString()
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', nextUrl)
}

function isEditableElement(target) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tagName = target.tagName
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT'
}

export default function App() {
  const initialUrl = useMemo(() => readInitialUrlState(), [])

  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState(initialUrl.status)
  const [viewMode, setViewMode] = useState(initialUrl.view)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const [isComposerOpen, setIsComposerOpen] = useState(true)
  const [composerDefaultStatus, setComposerDefaultStatus] = useState('Todo')
  const [composerFocusTick, setComposerFocusTick] = useState(0)

  const [isCreating, setIsCreating] = useState(false)
  const [pendingTaskIds, setPendingTaskIds] = useState(() => new Set())
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [toasts, setToasts] = useState([])

  const tasksRef = useRef(tasks)
  const searchInputRef = useRef(null)
  const toastIdRef = useRef(0)
  const toastTimersRef = useRef(new Map())

  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    const timers = toastTimersRef.current
    return () => {
      for (const timerId of timers.values()) {
        clearTimeout(timerId)
      }
      timers.clear()
    }
  }, [])

  const dismissToast = useCallback((toastId) => {
    const activeTimer = toastTimersRef.current.get(toastId)
    if (activeTimer) {
      clearTimeout(activeTimer)
      toastTimersRef.current.delete(toastId)
    }
    setToasts((prev) => prev.filter((item) => item.id !== toastId))
  }, [])

  const addToast = useCallback(
    ({ message, tone = 'success', onUndo = null }) => {
      toastIdRef.current += 1
      const id = toastIdRef.current
      setToasts((prev) => [...prev.slice(-2), { id, message, tone, onUndo }])

      const timerId = setTimeout(() => {
        dismissToast(id)
      }, 4500)
      toastTimersRef.current.set(id, timerId)
    },
    [dismissToast],
  )

  const loadTasks = useCallback(async (signal) => {
    setIsLoading(true)
    setError('')
    try {
      const items = await fetchTasks(signal)
      setTasks(items)
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') return
      setError(
        getApiErrorMessage(err, 'Cannot reach the server. Make sure the backend API is running.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadTasks(controller.signal)
    return () => controller.abort()
  }, [loadTasks])

  useEffect(() => {
    syncUrlParams(filterStatus, viewMode)
  }, [filterStatus, viewMode])

  useEffect(() => {
    function handleShortcutKeyDown(event) {
      if (editingTask || deletingTask) return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (isEditableElement(event.target)) return

      if (event.key === '/') {
        event.preventDefault()
        searchInputRef.current?.focus()
      } else if (event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setIsComposerOpen(true)
        setComposerFocusTick((tick) => tick + 1)
      }
    }

    window.addEventListener('keydown', handleShortcutKeyDown)
    return () => window.removeEventListener('keydown', handleShortcutKeyDown)
  }, [deletingTask, editingTask])

  const counts = useMemo(() => {
    const nextCounts = {
      All: tasks.length,
      Todo: 0,
      'In Progress': 0,
      Done: 0,
    }
    for (const task of tasks) {
      if (nextCounts[task.status] !== undefined) {
        nextCounts[task.status] += 1
      }
    }
    return nextCounts
  }, [tasks])

  const visibleTasks = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    const filtered = tasks.filter((task) => {
      if (filterStatus !== 'All' && task.status !== filterStatus) {
        return false
      }
      if (!needle) return true
      const titleMatch = task.title.toLowerCase().includes(needle)
      const descMatch = task.description ? task.description.toLowerCase().includes(needle) : false
      return titleMatch || descMatch
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      const timeA = Date.parse(a.created_at) || 0
      const timeB = Date.parse(b.created_at) || 0
      if (sortBy === 'oldest') {
        return timeA - timeB || a.id - b.id
      }
      return timeB - timeA || b.id - a.id
    })
  }, [filterStatus, searchQuery, sortBy, tasks])

  const markTaskPending = useCallback((taskId, pending) => {
    setPendingTaskIds((prev) => {
      const next = new Set(prev)
      if (pending) {
        next.add(taskId)
      } else {
        next.delete(taskId)
      }
      return next
    })
  }, [])

  const handleToggleComposer = useCallback(() => {
    setIsComposerOpen((prev) => !prev)
  }, [])

  const handleOpenComposer = useCallback(() => {
    setComposerDefaultStatus('Todo')
    setIsComposerOpen(true)
    setComposerFocusTick((tick) => tick + 1)
  }, [])

  const handleQuickAddInColumn = useCallback((columnStatus) => {
    setComposerDefaultStatus(columnStatus)
    setIsComposerOpen(true)
    setComposerFocusTick((tick) => tick + 1)
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilterStatus('All')
    setSearchQuery('')
  }, [])

  async function handleCreateTask(payload) {
    setIsCreating(true)
    setError('')
    try {
      const created = await createTask(payload)
      setTasks((prev) => [created, ...prev])
      addToast({ message: `Added “${created.title}” to ${created.status}` })
      return true
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create the task. Please try again.'))
      return false
    } finally {
      setIsCreating(false)
    }
  }

  const handleStatusChange = useCallback(
    async (taskId, nextStatus, { showUndo = true } = {}) => {
      const currentTask = tasksRef.current.find((item) => item.id === taskId)
      if (!currentTask || currentTask.status === nextStatus) return

      const previousStatus = currentTask.status
      setError('')
      setTasks((prev) =>
        prev.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item)),
      )
      markTaskPending(taskId, true)

      try {
        const updated = await updateTask(taskId, { status: nextStatus })
        setTasks((prev) => prev.map((item) => (item.id === taskId ? updated : item)))

        if (showUndo) {
          addToast({
            message: `Moved “${updated.title}” to ${nextStatus}`,
            onUndo: () => handleStatusChange(taskId, previousStatus, { showUndo: false }),
          })
        } else {
          addToast({
            tone: 'info',
            message: `Restored “${updated.title}” to ${nextStatus}`,
          })
        }
      } catch (err) {
        setTasks((prev) =>
          prev.map((item) => (item.id === taskId ? { ...item, status: previousStatus } : item)),
        )
        setError(getApiErrorMessage(err, 'Could not update task status.'))
      } finally {
        markTaskPending(taskId, false)
      }
    },
    [addToast, markTaskPending],
  )

  const handleMoveTask = useCallback(
    (taskId, targetStatus) => {
      handleStatusChange(taskId, targetStatus, { showUndo: true })
    },
    [handleStatusChange],
  )

  async function handleSaveEdit(taskId, payload) {
    setError('')
    markTaskPending(taskId, true)
    try {
      const updated = await updateTask(taskId, payload)
      setTasks((prev) => prev.map((item) => (item.id === taskId ? updated : item)))
      setEditingTask(null)
      addToast({ message: `Saved changes to “${updated.title}”` })
      return null
    } catch (err) {
      return getApiErrorMessage(err, 'Could not save task changes.')
    } finally {
      markTaskPending(taskId, false)
    }
  }

  async function handleConfirmDelete(taskId) {
    setError('')
    markTaskPending(taskId, true)
    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((item) => item.id !== taskId))
      setDeletingTask(null)
      addToast({ tone: 'info', message: `Deleted task #${taskId}` })
      return null
    } catch (err) {
      return getApiErrorMessage(err, 'Could not delete task.')
    } finally {
      markTaskPending(taskId, false)
    }
  }

  const hasSearchQuery = Boolean(searchQuery.trim())

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F172A]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[#1D4ED8] focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to tasks
      </a>

      <Header
        counts={counts}
        isComposerOpen={isComposerOpen}
        onToggleComposer={handleToggleComposer}
      />

      <main id="main-content" className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {error ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
              <p className="font-medium">{error}</p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => loadTasks()}
                className="inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-white px-3 py-1.5 text-xs font-medium text-[#991B1B] hover:bg-[#FEF2F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Try again
              </button>
              <button
                type="button"
                onClick={() => setError('')}
                aria-label="Dismiss error"
                className="touch-manipulation rounded-lg p-1 text-[#991B1B] hover:bg-[#FEE2E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}

        <StatsSummary
          counts={counts}
          activeFilter={filterStatus}
          onFilterSelect={setFilterStatus}
        />

        {isComposerOpen ? (
          <TaskForm
            onCreateTask={handleCreateTask}
            isSubmitting={isCreating}
            defaultStatus={composerDefaultStatus}
            focusSignal={composerFocusTick}
            onCollapse={() => setIsComposerOpen(false)}
          />
        ) : null}

        <Toolbar
          activeFilter={filterStatus}
          counts={counts}
          onFilterChange={setFilterStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === 'board' ? (
          <TaskBoard
            tasks={visibleTasks}
            totalTaskCount={tasks.length}
            activeFilter={filterStatus}
            hasSearchQuery={hasSearchQuery}
            isLoading={isLoading}
            pendingTaskIds={pendingTaskIds}
            onStatusChange={handleStatusChange}
            onMoveTask={handleMoveTask}
            onEditClick={setEditingTask}
            onDeleteClick={setDeletingTask}
            onQuickAddInColumn={handleQuickAddInColumn}
            onResetFilters={handleResetFilters}
            onOpenComposer={handleOpenComposer}
          />
        ) : (
          <TaskList
            tasks={visibleTasks}
            totalTaskCount={tasks.length}
            activeFilter={filterStatus}
            hasSearchQuery={hasSearchQuery}
            isLoading={isLoading}
            pendingTaskIds={pendingTaskIds}
            onStatusChange={handleStatusChange}
            onEditClick={setEditingTask}
            onDeleteClick={setDeletingTask}
            onResetFilters={handleResetFilters}
            onOpenComposer={handleOpenComposer}
          />
        )}

        <footer className="hidden items-center justify-between border-t border-[#E4E7EC] pt-4 text-xs text-[#64748B] sm:flex">
          <p>
            Tip: Drag cards between columns, click a title to edit details, or use the quick action button on any card.
          </p>
          <p className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-[#CBD5E1] bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#334155]">
                /
              </kbd>{' '}
              Search
            </span>
            <span>
              <kbd className="rounded border border-[#CBD5E1] bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#334155]">
                n
              </kbd>{' '}
              New task
            </span>
          </p>
        </footer>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {editingTask ? (
        <EditTaskModal
          task={editingTask}
          isSaving={pendingTaskIds.has(editingTask.id)}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveEdit}
        />
      ) : null}

      {deletingTask ? (
        <ConfirmDeleteModal
          task={deletingTask}
          isDeleting={pendingTaskIds.has(deletingTask.id)}
          onCancel={() => setDeletingTask(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </div>
  )
}
