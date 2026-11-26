import axios, {
  type AxiosError,
  type AxiosInstance,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/lib/env.ts'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthHeader?: boolean
    skipAuthRefresh?: boolean
  }
}

export const API_PREFIX = '/api/v1'

export interface ApiFieldError {
  field: string
  message: string
}

export interface HttpClientErrorOptions {
  status: number | null
  code: string | null
  details?: unknown
  isNetworkError: boolean
  cause?: unknown
}

export class HttpClientError extends Error {
  readonly status: number | null
  readonly code: string | null
  readonly details: unknown
  readonly isNetworkError: boolean

  constructor(message: string, options: HttpClientErrorOptions) {
    super(message, { cause: options.cause })
    this.name = 'HttpClientError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
    this.isNetworkError = options.isNetworkError
  }
}

export interface HttpAuthHandlers {
  /** Must return only an in-memory access token; never read refresh tokens from localStorage. */
  getAccessToken?: () => string | null
  /** Optional check to proactively refresh an expiring access token before sending a request. */
  shouldRefreshToken?: () => boolean
  /** Rotates the session via /auth/refresh and returns the new access token, or null when unavailable. */
  refreshAccessToken?: () => Promise<string | null>
  onUnauthorized?: (error: HttpClientError) => void
}

let authHandlers: HttpAuthHandlers = {}

export function configureHttpClientAuth(handlers: HttpAuthHandlers): void {
  authHandlers = handlers
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readStringField(
  record: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return null
}

export function resolveApiBaseUrl(rawUrl?: string): string {
  const base =
    typeof rawUrl === 'string'
      ? rawUrl.trim().replace(/\/+$/, '')
      : env.apiBaseUrl

  if (base === '') {
    return API_PREFIX
  }
  if (base.endsWith(API_PREFIX)) {
    return base
  }
  return `${base}${API_PREFIX}`
}

export function getHttpFieldErrors(error: unknown): ApiFieldError[] {
  if (!isHttpClientError(error) || !isRecord(error.details)) {
    return []
  }

  const rawFieldErrors = error.details.fieldErrors
  if (!Array.isArray(rawFieldErrors)) {
    return []
  }

  const parsedErrors: ApiFieldError[] = []
  for (const item of rawFieldErrors) {
    if (!isRecord(item)) {
      continue
    }
    const field = readStringField(item, ['field'])
    const message = readStringField(item, ['message'])
    if (field && message) {
      parsedErrors.push({ field, message })
    }
  }

  return parsedErrors
}

export function normalizeHttpError(error: unknown): HttpClientError {
  if (error instanceof HttpClientError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null
    const data: unknown = error.response?.data
    const isNetworkError = !error.response

    let message = isNetworkError
      ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
      : 'Não foi possível concluir a requisição.'
    let code: string | null = error.code ?? null

    if (isRecord(data)) {
      const serverMessage = readStringField(data, [
        'message',
        'detail',
        'error',
      ])
      if (serverMessage) {
        message = serverMessage
      }
      const serverCode = readStringField(data, ['code'])
      if (serverCode) {
        code = serverCode
      }
    } else if (typeof data === 'string' && data.trim().length > 0) {
      message = data.trim()
    } else if (error.message.trim().length > 0 && !isNetworkError) {
      message = error.message.trim()
    }

    return new HttpClientError(message, {
      status,
      code,
      details: data,
      isNetworkError,
      cause: error,
    })
  }

  if (error instanceof Error) {
    return new HttpClientError(
      error.message || 'Erro inesperado ao processar a requisição.',
      {
        status: null,
        code: null,
        isNetworkError: false,
        cause: error,
      },
    )
  }

  return new HttpClientError('Erro inesperado ao processar a requisição.', {
    status: null,
    code: null,
    details: error,
    isNetworkError: false,
  })
}

const PUBLIC_AUTH_NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
] as const

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _authRetried?: boolean
}

function isAuthRefreshExcluded(config: InternalAxiosRequestConfig): boolean {
  if (config.skipAuthRefresh) {
    return true
  }
  const rawPath = (config.url ?? '').split('?')[0] ?? ''
  return PUBLIC_AUTH_NO_REFRESH_PATHS.some(
    (path) => rawPath === path || rawPath.endsWith(path),
  )
}

export function createHttpClient(
  config: CreateAxiosDefaults = {},
): AxiosInstance {
  const instance = axios.create({
    baseURL: resolveApiBaseUrl(),
    timeout: env.apiTimeoutMs,
    headers: {
      Accept: 'application/json',
    },
    ...config,
  })

  let inFlightRefresh: Promise<string | null> | null = null

  async function executeSingleFlightRefresh(): Promise<string | null> {
    if (!authHandlers.refreshAccessToken) {
      return null
    }

    if (!inFlightRefresh) {
      const refreshFn = authHandlers.refreshAccessToken
      inFlightRefresh = (async () => {
        try {
          return (await refreshFn()) ?? null
        } catch (refreshError) {
          const normalizedRefreshError = normalizeHttpError(refreshError)
          if (
            normalizedRefreshError.status === 400 ||
            normalizedRefreshError.status === 401 ||
            normalizedRefreshError.status === 403
          ) {
            authHandlers.onUnauthorized?.(normalizedRefreshError)
          }
          throw normalizedRefreshError
        } finally {
          inFlightRefresh = null
        }
      })()
    }

    return inFlightRefresh
  }

  instance.interceptors.request.use(async (requestConfig) => {
    if (requestConfig.skipAuthHeader) {
      requestConfig.headers.delete('Authorization')
      return requestConfig
    }

    if (!requestConfig.headers.has('Authorization')) {
      if (
        !isAuthRefreshExcluded(requestConfig) &&
        authHandlers.shouldRefreshToken?.() &&
        authHandlers.refreshAccessToken
      ) {
        await executeSingleFlightRefresh()
      }

      const token = authHandlers.getAccessToken?.()
      if (token && token.trim().length > 0) {
        requestConfig.headers.setAuthorization(`Bearer ${token.trim()}`)
      }
    }

    return requestConfig
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (error instanceof HttpClientError) {
        return Promise.reject(error)
      }

      const normalized = normalizeHttpError(error)
      if (normalized.status !== 401) {
        return Promise.reject(normalized)
      }

      const originalConfig = axios.isAxiosError(error)
        ? (error.config as RetriableRequestConfig | undefined)
        : undefined

      if (originalConfig?.skipAuthRefresh) {
        return Promise.reject(normalized)
      }

      if (
        !originalConfig ||
        originalConfig._authRetried ||
        isAuthRefreshExcluded(originalConfig) ||
        !authHandlers.refreshAccessToken
      ) {
        authHandlers.onUnauthorized?.(normalized)
        return Promise.reject(normalized)
      }

      const refreshedToken = await executeSingleFlightRefresh()
      if (!refreshedToken || refreshedToken.trim().length === 0) {
        authHandlers.onUnauthorized?.(normalized)
        return Promise.reject(normalized)
      }

      originalConfig._authRetried = true
      originalConfig.headers.setAuthorization(`Bearer ${refreshedToken.trim()}`)
      return instance.request(originalConfig)
    },
  )

  return instance
}

/**
 * Shared Axios instance for API communication with Bearer injection
 * and single-flight access token refresh (`FE-037`).
 */
export const httpClient: AxiosInstance = createHttpClient()

export function isHttpClientError(error: unknown): error is HttpClientError {
  return error instanceof HttpClientError
}

export type { AxiosError }
