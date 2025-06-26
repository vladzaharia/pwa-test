import { useState, useEffect, useCallback } from 'react'
import { TodoItem } from '../types'
import { syncService } from '../services/syncService'

interface UseTodosProps {
  isOnline: boolean
  addPendingSync?: (action: string) => void
  todos: TodoItem[]
  setTodos: (todos: TodoItem[]) => void
}

export function useTodos({
  isOnline,
  addPendingSync,
  todos,
  setTodos,
}: UseTodosProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Use local API server
      const response = await fetch('/api/todos')

      if (!response.ok) {
        throw new Error('Failed to fetch todos')
      }

      const data: TodoItem[] = await response.json()
      const todosWithCache = data.map((todo) => ({ ...todo, cached: false }))

      setTodos(todosWithCache)

      // Cache the data
      localStorage.setItem('pwa-todos', JSON.stringify(todosWithCache))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')

      // If fetch fails and we have cached data, show it
      const cachedTodos = JSON.parse(localStorage.getItem('pwa-todos') || '[]')
      if (cachedTodos.length > 0) {
        setTodos(
          cachedTodos.map((todo: TodoItem) => ({ ...todo, cached: true }))
        )
        setError('Using cached data - network unavailable')
      }
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Remove setTodos dependency to prevent infinite loop

  // One-time setup effect - runs only once on mount
  useEffect(() => {
    // Load cached todos
    const cachedTodos = JSON.parse(localStorage.getItem('pwa-todos') || '[]')
    if (cachedTodos.length > 0) {
      setTodos(cachedTodos.map((todo: TodoItem) => ({ ...todo, cached: true })))
    }

    // Try to fetch fresh data if online
    if (navigator.onLine) {
      fetchTodos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - this should run only once on mount

  const addTodo = useCallback(
    async (title: string) => {
      if (!title.trim()) return

      const todoTitle = title.trim()

      if (isOnline) {
        // Try to add to server first
        try {
          const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: todoTitle }),
          })

          if (response.ok) {
            const newTodoItem = await response.json()
            const updatedTodos = [{ ...newTodoItem, cached: false }, ...todos]
            setTodos(updatedTodos)
            localStorage.setItem('pwa-todos', JSON.stringify(updatedTodos))
            return
          }
        } catch (error) {
          console.log('Failed to add to server, adding locally:', error)
        }
      }

      // Fallback to local storage (offline or server error)
      const newTodoItem: TodoItem = {
        id: Date.now(),
        title: todoTitle,
        completed: false,
        cached: true,
        lastModified: Date.now(),
        syncStatus: 'pending',
      }

      const updatedTodos = [newTodoItem, ...todos]
      setTodos(updatedTodos)
      localStorage.setItem('pwa-todos', JSON.stringify(updatedTodos))

      // Add to sync service queue
      syncService.addPendingOperation('create', newTodoItem.id, {
        title: newTodoItem.title,
        completed: newTodoItem.completed,
      })

      // Queue for sync - the actual sync will log the result
      const action = `Added todo: "${newTodoItem.title}"`
      if (!isOnline) {
        addPendingSync?.(action)
      }
    },
    [isOnline, todos, setTodos, addPendingSync]
  )

  const toggleTodo = useCallback(
    async (id: number) => {
      const todo = todos.find((t) => t.id === id)
      if (!todo) return

      const newCompleted = !todo.completed

      if (isOnline && !todo.cached) {
        // Try to update on server
        try {
          const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: newCompleted }),
          })

          if (response.ok) {
            const updatedTodo = await response.json()
            const updatedTodos = todos.map((t) =>
              t.id === id ? { ...updatedTodo, cached: false } : t
            )
            setTodos(updatedTodos)
            localStorage.setItem('pwa-todos', JSON.stringify(updatedTodos))
            return
          }
        } catch (error) {
          console.log('Failed to update on server, updating locally:', error)
        }
      }

      // Fallback to local update
      const updatedTodos = todos.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: newCompleted,
              cached: true,
              lastModified: Date.now(),
              syncStatus: 'pending' as const,
            }
          : t
      )
      setTodos(updatedTodos)
      localStorage.setItem('pwa-todos', JSON.stringify(updatedTodos))

      // Add to sync service queue if needed
      if (!isOnline || todo.cached) {
        syncService.addPendingOperation('update', id, {
          completed: newCompleted,
        })

        // Queue for sync - the actual sync will log the result
        const action = `Toggled todo: "${todo.title}" to ${newCompleted ? 'completed' : 'incomplete'}`
        if (!isOnline) {
          addPendingSync?.(action)
        }
      }
    },
    [isOnline, todos, setTodos, addPendingSync]
  )

  const clearTodos = useCallback(async () => {
    if (isOnline) {
      // Try to clear on server
      try {
        const response = await fetch('/api/todos', {
          method: 'DELETE',
        })

        if (response.ok) {
          setTodos([])
          localStorage.removeItem('pwa-todos')
          return
        }
      } catch (error) {
        console.log('Failed to clear on server, clearing locally:', error)
      }
    }

    // Fallback to local clear
    setTodos([])
    localStorage.removeItem('pwa-todos')

    // Add to sync service queue for each todo
    todos.forEach((todo) => {
      syncService.addPendingOperation('delete', todo.id, {})
    })

    // Queue for sync - the actual sync will log the result
    const action = 'Cleared all todos'
    if (!isOnline) {
      addPendingSync?.(action)
    }
  }, [isOnline, setTodos, todos, addPendingSync])

  return {
    loading,
    error,
    fetchTodos,
    addTodo,
    toggleTodo,
    clearTodos,
  }
}
