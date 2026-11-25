import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  API_PREFIX,
  configureHttpClientAuth,
  createHttpClient,
  getHttpFieldErrors,
  HttpClientError,
  isHttpClientError,
  resolveApiBaseUrl,
} from '@/services/httpClient.ts'

function createJsonResponse(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
) {
  return {
    data: JSON.stringify(data),
    status,
    statusText: 'OK',
    headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
    config,
  }
}

function createProblemError(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosError {
  return new AxiosError(
    `Request failed with status code ${status}`,
    status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    undefined,
    {
      data: JSON.stringify(data),
      status,
      statusText: 'Error',
      headers: new AxiosHeaders({ 'Content-Type': 'application/problem+json' }),
      config,
    },
  )
}

describe('httpClient helpers and interceptors', () => {
  afterEach(() => {
    configureHttpClientAuth({})
  })

  it('resolveApiBaseUrl garante o prefixo /api/v1 sem duplicar', () => {
    expect(API_PREFIX).toBe('/api/v1')
    expect(resolveApiBaseUrl('')).toBe('/api/v1')
    expect(resolveApiBaseUrl('http://localhost:8080/')).toBe(
      'http://localhost:8080/api/v1',
    )
    expect(resolveApiBaseUrl('http://localhost:8080/api/v1/')).toBe(
      'http://localhost:8080/api/v1',
    )
    expect(resolveApiBaseUrl('/api/v1')).toBe('/api/v1')
  })

  it('getHttpFieldErrors extrai lista RFC 7807 fieldErrors com segurança', () => {
    const httpError = new HttpClientError('Dados inválidos', {
      status: 400,
      code: 'VALIDATION_ERROR',
      isNetworkError: false,
      details: {
        fieldErrors: [
          { field: 'nome', message: 'nome e obrigatorio' },
          { field: 'email', message: 'formato de e-mail invalido' },
          { field: 123, message: 'ignorar inválido' },
        ],
      },
    })

    expect(getHttpFieldErrors(httpError)).toEqual([
      { field: 'nome', message: 'nome e obrigatorio' },
      { field: 'email', message: 'formato de e-mail invalido' },
    ])
    expect(getHttpFieldErrors(new Error('erro comum'))).toEqual([])
  })

  it('injeta Bearer token automaticamente nas requisições sem sobrescrever Authorization explícito', async () => {
    let token: string | null = '  jwt-token-123  '
    configureHttpClientAuth({ getAccessToken: () => token })

    const capturedAuthHeaders: Array<string | undefined> = []
    const adapter: AxiosAdapter = async (config) => {
      const header = config.headers.get('Authorization')
      capturedAuthHeaders.push(typeof header === 'string' ? header : undefined)
      return createJsonResponse(config, 200, { ok: true })
    }

    const client = createHttpClient({ adapter })

    await client.get('/disciplinas')
    await client.get('/disciplinas', {
      headers: { Authorization: 'Bearer custom-token' },
    })

    token = '   '
    await client.get('/disciplinas')

    expect(capturedAuthHeaders).toEqual([
      'Bearer jwt-token-123',
      'Bearer custom-token',
      undefined,
    ])
  })

  it('normaliza payload RFC 7807 400 VALIDATION_ERROR (application/problem+json) preservando fieldErrors', async () => {
    const onUnauthorized = vi.fn()
    configureHttpClientAuth({ onUnauthorized })

    const adapter: AxiosAdapter = async (config) => {
      throw createProblemError(config, 400, {
        type: 'https://api.uniflow.dev/errors/validation-error',
        title: 'Dados inválidos',
        status: 400,
        detail: 'Um ou mais campos estão inválidos.',
        instance: '/api/v1/auth/register',
        code: 'VALIDATION_ERROR',
        timestamp: '2026-11-25T11:50:00Z',
        fieldErrors: [
          { field: 'nome', message: 'nome e obrigatorio' },
          { field: 'email', message: 'formato de e-mail invalido' },
        ],
      })
    }

    const client = createHttpClient({ adapter })

    let capturedError: unknown
    try {
      await client.post('/auth/register', { nome: '' })
    } catch (error) {
      capturedError = error
    }

    expect(isHttpClientError(capturedError)).toBe(true)
    if (isHttpClientError(capturedError)) {
      expect(capturedError.status).toBe(400)
      expect(capturedError.code).toBe('VALIDATION_ERROR')
      expect(capturedError.message).toBe('Um ou mais campos estão inválidos.')
      expect(capturedError.isNetworkError).toBe(false)
      expect(getHttpFieldErrors(capturedError)).toEqual([
        { field: 'nome', message: 'nome e obrigatorio' },
        { field: 'email', message: 'formato de e-mail invalido' },
      ])
    }
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('normaliza 409 RESOURCE_CONFLICT e aciona onUnauthorized apenas em 401', async () => {
    const onUnauthorized = vi.fn()
    configureHttpClientAuth({ onUnauthorized })

    const conflictClient = createHttpClient({
      adapter: async (config) => {
        throw createProblemError(config, 409, {
          status: 409,
          detail: 'Ja existe um usuario cadastrado com este e-mail.',
          code: 'RESOURCE_CONFLICT',
        })
      },
    })

    await expect(
      conflictClient.post('/auth/register', {}),
    ).rejects.toMatchObject({
      name: 'HttpClientError',
      status: 409,
      code: 'RESOURCE_CONFLICT',
      message: 'Ja existe um usuario cadastrado com este e-mail.',
      isNetworkError: false,
    })
    expect(onUnauthorized).not.toHaveBeenCalled()

    const unauthorizedClient = createHttpClient({
      adapter: async (config) => {
        throw createProblemError(config, 401, {
          status: 401,
          detail: 'Credenciais inválidas.',
          code: 'AUTHENTICATION_FAILED',
        })
      },
    })

    await expect(
      unauthorizedClient.post('/auth/login', {}),
    ).rejects.toMatchObject({
      name: 'HttpClientError',
      status: 401,
      code: 'AUTHENTICATION_FAILED',
      message: 'Credenciais inválidas.',
      isNetworkError: false,
    })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(onUnauthorized.mock.calls[0]?.[0]).toMatchObject({
      status: 401,
      code: 'AUTHENTICATION_FAILED',
    })
  })

  it('normaliza falha de rede sem response como isNetworkError=true', async () => {
    const client = createHttpClient({
      adapter: async (config) => {
        throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config)
      },
    })

    await expect(client.get('/semestres')).rejects.toMatchObject({
      name: 'HttpClientError',
      status: null,
      code: AxiosError.ERR_NETWORK,
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
      isNetworkError: true,
    })
  })
})
