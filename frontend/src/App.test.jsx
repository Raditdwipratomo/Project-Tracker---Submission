import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import * as taskApi from './services/taskApi'

vi.mock('./services/taskApi', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    fetchTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }
})

const SAMPLE_TASKS = [
  {
    id: 2,
    title: 'Build React frontend',
    description: 'Create responsive task board UI',
    status: 'In Progress',
    created_at: '2026-11-14T10:30:00Z',
    updated_at: '2026-11-14T10:30:00Z',
  },
  {
    id: 1,
    title: 'Setup FastAPI backend',
    description: null,
    status: 'Done',
    created_at: '2026-11-14T09:00:00Z',
    updated_at: '2026-11-14T10:00:00Z',
  },
]

describe('Project Tracker App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.replaceState(null, '', '/')
  })

  it('shows loading indicator then renders empty state when no tasks exist (US-01)', async () => {
    let resolveFetch
    taskApi.fetchTasks.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )

    render(<App />)

    expect(screen.getByRole('status', { name: /loading tasks/i })).toBeInTheDocument()
    resolveFetch([])

    expect(await screen.findByText('No tasks yet')).toBeInTheDocument()
    expect(taskApi.fetchTasks).toHaveBeenCalledTimes(1)
  })

  it('displays an informative error banner when fetching tasks fails', async () => {
    taskApi.fetchTasks.mockRejectedValueOnce(new Error('Network Error'))

    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/cannot reach the server/i)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('validates empty/whitespace titles and creates a task without re-fetching GET /tasks (US-02)', async () => {
    const user = userEvent.setup()
    taskApi.fetchTasks.mockResolvedValueOnce([...SAMPLE_TASKS])
    taskApi.createTask.mockResolvedValueOnce({
      id: 3,
      title: 'Write README guide',
      description: 'Add setup instructions',
      status: 'Todo',
      created_at: '2026-11-14T11:00:00Z',
      updated_at: '2026-11-14T11:00:00Z',
    })

    render(<App />)
    await screen.findByText('Build React frontend')

    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    const submitBtn = screen.getByRole('button', { name: /add task/i })

    // Whitespace-only title should fail client validation
    await user.type(titleInput, '   ')
    await user.click(submitBtn)
    expect(screen.getByText(/enter a task title before adding/i)).toBeInTheDocument()
    expect(taskApi.createTask).not.toHaveBeenCalled()

    await user.clear(titleInput)
    await user.type(titleInput, 'Write README guide')
    await user.type(descriptionInput, 'Add setup instructions')
    await user.click(submitBtn)

    expect(await screen.findByText('Write README guide')).toBeInTheDocument()
    expect(taskApi.createTask).toHaveBeenCalledWith({
      title: 'Write README guide',
      description: 'Add setup instructions',
      status: 'Todo',
    })
    // Confirm state updated directly from response without calling GET /tasks again
    expect(taskApi.fetchTasks).toHaveBeenCalledTimes(1)
    expect(titleInput).toHaveValue('')
    expect(descriptionInput).toHaveValue('')
  })

  it('supports filtering by status, quick status change, and editing via modal (US-03)', async () => {
    const user = userEvent.setup()
    taskApi.fetchTasks.mockResolvedValueOnce([...SAMPLE_TASKS])
    taskApi.updateTask
      .mockResolvedValueOnce({
        ...SAMPLE_TASKS[0],
        status: 'Done',
      })
      .mockResolvedValueOnce({
        ...SAMPLE_TASKS[0],
        title: 'Build React & Tailwind UI',
        description: 'Updated description',
        status: 'Done',
      })

    render(<App />)
    await screen.findByText('Build React frontend')

    // Quick status update
    const statusDropdown = screen.getByLabelText('Status for Build React frontend')
    await user.selectOptions(statusDropdown, 'Done')

    await waitFor(() => {
      expect(taskApi.updateTask).toHaveBeenCalledWith(2, { status: 'Done' })
    })

    // Open Edit modal
    await user.click(screen.getByRole('button', { name: 'Edit Build React frontend' }))
    const dialog = screen.getByRole('dialog')
    const modalTitleInput = within(dialog).getByLabelText(/title/i)
    const modalDescInput = within(dialog).getByLabelText(/description/i)

    await user.clear(modalTitleInput)
    await user.type(modalTitleInput, 'Build React & Tailwind UI')
    await user.clear(modalDescInput)
    await user.type(modalDescInput, 'Updated description')
    await user.click(within(dialog).getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('Build React & Tailwind UI')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Filter tabs
    const todoTab = screen.getByRole('tab', { name: /todo/i })
    await user.click(todoTab)
    expect(screen.getByText('No Todo tasks')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show all tasks/i }))
    expect(screen.getByText('Build React & Tailwind UI')).toBeInTheDocument()
    expect(taskApi.fetchTasks).toHaveBeenCalledTimes(1)
  })

  it('confirms before deleting a task and removes it on confirmation (US-04)', async () => {
    const user = userEvent.setup()
    taskApi.fetchTasks.mockResolvedValueOnce([...SAMPLE_TASKS])
    taskApi.deleteTask.mockResolvedValueOnce({ message: 'Task deleted successfully.', id: 1 })

    render(<App />)
    await screen.findByText('Setup FastAPI backend')

    await user.click(screen.getByRole('button', { name: 'Delete Setup FastAPI backend' }))
    const alertDialog = screen.getByRole('alertdialog')
    expect(alertDialog).toHaveTextContent(/setup fastapi backend/i)

    // Cancel keeps the task
    await user.click(within(alertDialog).getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('Setup FastAPI backend')).toBeInTheDocument()
    expect(taskApi.deleteTask).not.toHaveBeenCalled()

    // Confirm removes the task
    await user.click(screen.getByRole('button', { name: 'Delete Setup FastAPI backend' }))
    const confirmDialog = screen.getByRole('alertdialog')
    await user.click(within(confirmDialog).getByRole('button', { name: /delete task/i }))

    await waitFor(() => {
      expect(screen.queryByText('Setup FastAPI backend')).not.toBeInTheDocument()
    })
    expect(taskApi.deleteTask).toHaveBeenCalledWith(1)
    expect(taskApi.fetchTasks).toHaveBeenCalledTimes(1)
  })

  it('switches between Kanban board and list view and supports column quick add', async () => {
    const user = userEvent.setup()
    taskApi.fetchTasks.mockResolvedValueOnce([...SAMPLE_TASKS])

    render(<App />)
    await screen.findByText('Build React frontend')

    // Board columns visible by default
    expect(screen.getByRole('region', { name: 'Todo column' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'In Progress column' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Done column' })).toBeInTheDocument()

    // Quick add in In Progress column selects In Progress radio pill
    await user.click(screen.getByRole('button', { name: 'Quick add to In Progress' }))
    expect(screen.getByRole('radio', { name: 'In Progress' })).toHaveAttribute('aria-checked', 'true')

    // Switch to List view and verify URL query param sync
    await user.click(screen.getByRole('button', { name: 'List' }))
    expect(screen.queryByRole('region', { name: 'In Progress column' })).not.toBeInTheDocument()
    expect(window.location.search).toContain('view=list')
    expect(screen.getByText('Build React frontend')).toBeInTheDocument()
  })

  it('filters tasks via search query and sorts items client-side', async () => {
    const user = userEvent.setup()
    taskApi.fetchTasks.mockResolvedValueOnce([...SAMPLE_TASKS])

    render(<App />)
    await screen.findByText('Build React frontend')

    // Sort alphabetically: Build React frontend comes before Setup FastAPI backend
    await user.selectOptions(screen.getByLabelText('Sort tasks'), 'title')
    await user.click(screen.getByRole('button', { name: 'List' }))
    const items = screen.getAllByRole('article')
    expect(items[0]).toHaveTextContent('Build React frontend')
    expect(items[1]).toHaveTextContent('Setup FastAPI backend')

    // Search filters visible items
    const searchInput = screen.getByLabelText('Search tasks')
    await user.type(searchInput, 'fastapi')
    expect(screen.queryByText('Build React frontend')).not.toBeInTheDocument()
    expect(screen.getByText('Setup FastAPI backend')).toBeInTheDocument()

    // Non-matching search shows search empty state
    await user.clear(searchInput)
    await user.type(searchInput, 'nonexistent keyword')
    expect(screen.getByText('No matching tasks')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show all tasks/i }))
    expect(screen.getByText('Build React frontend')).toBeInTheDocument()
  })

  it('supports StatsSummary filtering and Undo toast after moving a task', async () => {
    const user = userEvent.setup()
    taskApi.fetchTasks.mockResolvedValueOnce([...SAMPLE_TASKS])
    taskApi.updateTask
      .mockResolvedValueOnce({ ...SAMPLE_TASKS[0], status: 'Done' })
      .mockResolvedValueOnce({ ...SAMPLE_TASKS[0], status: 'In Progress' })

    render(<App />)
    await screen.findByText('Build React frontend')

    // Quick advance button moves task to Done and exposes Undo toast
    await user.click(screen.getByRole('button', { name: 'Move Build React frontend to Done' }))
    expect(await screen.findByText(/Moved “Build React frontend” to Done/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /undo/i }))
    await waitFor(() => {
      expect(taskApi.updateTask).toHaveBeenNthCalledWith(2, 2, { status: 'In Progress' })
    })

    // Clicking Done KPI card filters view
    const summarySection = screen.getByRole('region', { name: 'Task summary' })
    await user.click(within(summarySection).getByRole('button', { name: /completed/i }))
    expect(screen.queryByText('Build React frontend')).not.toBeInTheDocument()
    expect(screen.getByText('Setup FastAPI backend')).toBeInTheDocument()
  })
})
