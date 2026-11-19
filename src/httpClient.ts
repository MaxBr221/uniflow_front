import axios, {
  AxiosError,
  type AxiosInstance,
  type CreateAxiosDefaults,
} from 'axios'

const DEFAULT_TIMEOUT_MS = 15_000

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
  const candidate = rawUrl ?? import.meta.env.VITE_API_BASE_URL
  if (typeof candidate !== 'string') {
    return ''
  }
  return candidate.trim().replace(/\/+$/, '')
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
      const serverMessage = readStringField(data, ['message', 'detail', 'error'])
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

export function createHttpClient(
  config: CreateAxiosDefaults = {},
): AxiosInstance {
  const instance = axios.create({
    baseURL: resolveApiBaseUrl(),
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      Accept: 'application/json',
    },
    ...config,
  })

  instance.interceptors.request.use((requestConfig) => {
    const token = authHandlers.getAccessToken?.()
    if (
      token &&
      token.trim().length > 0 &&
      !requestConfig.headers.has('Authorization')
    ) {
      requestConfig.headers.setAuthorization(`Bearer ${token.trim()}`)
    }
    return requestConfig
  })

  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const normalized = normalizeHttpError(error)
      if (normalized.status === 401) {
        authHandlers.onUnauthorized?.(normalized)
      }
      return Promise.reject(normalized)
    },
  )

  return instance
}

/**
 * Shared Axios instance for API communication.
 * `withCredentials`, final `baseURL`, and token refresh interceptors (`FE-037`)
 * should be aligned with `docs/API_CONTRACT.md` once provided.
 */
export const httpClient: AxiosInstance = createHttpClient()

export function isHttpClientError(error: unknown): error is HttpClientError {
  return error instanceof HttpClientError
}

export type { AxiosError }
