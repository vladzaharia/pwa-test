import { withRetry, withTimeout, AsyncCache } from '../lib/async-utils'
import type { TodoItem } from '../types'

/**
 * Optimized API service with caching, retry logic, and proper error handling
 */

export interface ApiConfig {
  baseUrl?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  cacheEnabled?: boolean
  cacheTtl?: number
}

export interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiService {
  private config: Required<ApiConfig>
  private cache: AsyncCache<unknown>

  constructor(config: ApiConfig = {}) {
    this.config = {
      baseUrl: '/api',
      timeout: 5000,
      retries: 3,
      retryDelay: 1000,
      cacheEnabled: true,
      cacheTtl: 5 * 60 * 1000, // 5 minutes
      ...config,
    }
    this.cache = new AsyncCache(this.config.cacheTtl)
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`
    const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`

    // Check cache for GET requests
    if (
      useCache &&
      this.config.cacheEnabled &&
      (!options.method || options.method === 'GET')
    ) {
      const cached = this.cache.get(cacheKey) as ApiResponse<T> | null
      if (cached) {
        return cached
      }
    }

    const requestOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const makeApiCall = async (): Promise<ApiResponse<T>> => {
      const response = await withTimeout(
        fetch(url, requestOptions),
        this.config.timeout,
        `Request to ${url} timed out after ${this.config.timeout}ms`
      )

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          response
        )
      }

      const data = await response.json()
      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }

      // Cache successful GET requests
      if (
        useCache &&
        this.config.cacheEnabled &&
        (!options.method || options.method === 'GET')
      ) {
        this.cache.set(cacheKey, apiResponse)
      }

      return apiResponse
    }

    return withRetry(makeApiCall, {
      maxRetries: this.config.retries,
      retryDelay: this.config.retryDelay,
      shouldRetry: (error) => {
        // Only retry on network errors or 5xx status codes
        if (error instanceof ApiError) {
          return error.status >= 500
        }
        return true // Network errors
      },
    })
  }

  async get<T>(endpoint: string, useCache = true): Promise<T> {
    const response = await this.makeRequest<T>(
      endpoint,
      { method: 'GET' },
      useCache
    )
    return response.data
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })

    // Invalidate related cache entries
    this.invalidateCache()
    return response.data
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })

    // Invalidate related cache entries
    this.invalidateCache()
    return response.data
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { method: 'DELETE' })

    // Invalidate related cache entries
    this.invalidateCache()
    return response.data
  }

  async head(endpoint: string): Promise<boolean> {
    try {
      await this.makeRequest(endpoint, { method: 'HEAD' })
      return true
    } catch {
      return false
    }
  }

  private invalidateCache(): void {
    // Simple cache invalidation - in a real app, this would be more sophisticated
    this.cache.clear()
  }

  clearCache(): void {
    this.cache.clear()
  }

  // Batch operations for better performance
  async batch<T>(requests: Array<() => Promise<T>>): Promise<Array<T | Error>> {
    return Promise.allSettled(requests.map((req) => req())).then((results) =>
      results.map((result) =>
        result.status === 'fulfilled' ? result.value : result.reason
      )
    )
  }
}

// Create a default instance
export const apiService = new ApiService()

// Specialized API services
export class TodoApiService {
  constructor(private api: ApiService = apiService) {}

  async getTodos(): Promise<TodoItem[]> {
    return this.api.get<TodoItem[]>('/todos')
  }

  async createTodo(todo: Partial<TodoItem>): Promise<TodoItem> {
    return this.api.post<TodoItem>('/todos', todo)
  }

  async updateTodo(id: number, updates: Partial<TodoItem>): Promise<TodoItem> {
    return this.api.put<TodoItem>(`/todos/${id}`, updates)
  }

  async deleteTodo(id: number): Promise<TodoItem> {
    return this.api.delete<TodoItem>(`/todos/${id}`)
  }

  async clearAllTodos(): Promise<{ message: string }> {
    return this.api.delete<{ message: string }>('/todos')
  }

  async checkHealth(): Promise<boolean> {
    return this.api.head('/todos')
  }
}

export const todoApi = new TodoApiService()
