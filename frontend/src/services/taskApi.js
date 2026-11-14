import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Normalize Axios errors into actionable user-facing messages.
 */
export function getApiErrorMessage(error, fallback = 'Request failed. Check the API connection and try again.') {
  if (axios.isCancel(error)) {
    return null
  }
  if (!error?.response) {
    return `Cannot reach the server at ${API_BASE_URL}. Confirm the backend is running and try again.`
  }

  const { status, data } = error.response
  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail
  }
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const first = data.detail[0]
    if (typeof first?.msg === 'string') {
      return first.msg
    }
  }
  if (status === 404) {
    return 'This task no longer exists on the server.'
  }
  if (status === 422) {
    return 'Check the task fields and fix any invalid input.'
  }
  return fallback
}

export async function fetchTasks(signal) {
  const response = await apiClient.get('/tasks', { signal })
  return response.data
}

export async function createTask(payload) {
  const response = await apiClient.post('/tasks', payload)
  return response.data
}

export async function updateTask(taskId, payload) {
  const response = await apiClient.put(`/tasks/${taskId}`, payload)
  return response.data
}

export async function deleteTask(taskId) {
  const response = await apiClient.delete(`/tasks/${taskId}`)
  return response.data
}
