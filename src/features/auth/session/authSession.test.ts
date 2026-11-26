import { waitFor } from '@testing-library/react'
import { AxiosError, AxiosHeaders, type AxiosAdapter } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  authSession,
  bindAuthSessionEffects,
  createAuthSessionManager,
  initializeAuthHttpClient,
  refreshAuthSession,
} from '@/features/auth/session/authSession.ts'
import type { AuthTokenResponse } from '@/features/auth/types/authTypes.ts'
import { createQueryClient } from '@/lib/queryClient.ts'
import { toastStore } from '@/lib/toast.ts'
import { httpClient } from '@/services/httpClient.ts'

const sampleTokenPayload: AuthTokenResponse = {
  accessToken: 'jwt-access-token',
  refreshToken: 'rft-opaque-token',
  expiresIn: 900,
  tokenType: 'Bearer',
  usuario: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nome: 'Ana Silva',
    email: 'ana.silva@uniflow.edu',
    status: 'ATIVO',
    createdAt: '2026-11-25T11:50:00Z',
    updatedAt: '2026-11-25T11:50:00Z',
  },
}

const secondUserTokenPayload: AuthTokenResponse = {
  accessToken: 'jwt-second-user',
  refreshToken: 'rft-second-user',
  expiresIn: 900,
  tokenType: 'Bearer',
  usuario: {
    id: '660e8400-e29b-41d4-a716-446655440111',
    nome: 'Bruno Costa',
    email: 'bruno.costa@uniflow.edu',
    status: 'ATIVO',
    createdAt: '2026-11-25T12:00:00Z',
    updatedAt: '2026-11-25T12:00:00Z',
  },
}

describe('authSession', () => {
  const originalAdapter = httpClient.defaults.adapter

  afterEach(() => {
    httpClient.defaults.adapter = originalAdapter
    authSession.clear()
    initializeAuthHttpClient()
    vi.restoreAllMocks()
  })

  it('armazena tokens apenas em memória (nunca em localStorage/sessionStorage), congela snapshot e notifica assinantes', () => {
    localStorage.clear()
    sessionStorage.clear()

    const listener = vi.fn()
    const unsubscribe = authSession.subscribe(listener)

    expect(authSession.isAuthenticated()).toBe(false)
    expect(authSession.getStatus()).toBe('anonymous')
    expect(authSession.getAccessToken()).toBeNull()
    expect(authSession.getRefreshToken()).toBeNull()
    expect(authSession.getAuthorizationHeader()).toBeNull()

    const saved = authSession.setSession(sampleTokenPayload)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(Object.isFrozen(saved)).toBe(true)
    expect(Object.isFrozen(saved.user)).toBe(true)
    expect(authSession.isAuthenticated()).toBe(true)
    expect(authSession.getStatus()).toBe('authenticated')
    expect(authSession.getAccessToken()).toBe('jwt-access-token')
    expect(authSession.getRefreshToken()).toBe('rft-opaque-token')
    expect(authSession.getAuthorizationHeader()).toBe('Bearer jwt-access-token')
    expect(authSession.getUser()?.nome).toBe('Ana Silva')
    expect(saved.expiresAt).toBeGreaterThan(Date.now())
    expect(localStorage).toHaveLength(0)
    expect(sessionStorage).toHaveLength(0)

    expect(authSession.clear()).toBe(true)
    expect(authSession.clear()).toBe(false)
    expect(listener).toHaveBeenCalledTimes(2)
    expect(authSession.isAuthenticated()).toBe(false)
    expect(authSession.getStatus()).toBe('anonymous')
    expect(authSession.getAccessToken()).toBeNull()
    expect(authSession.getRefreshToken()).toBeNull()

    unsubscribe()
  })

  it('rejeita accessToken vazio na criação de sessão', () => {
    expect(() =>
      authSession.setSession({
        ...sampleTokenPayload,
        accessToken: '   ',
      }),
    ).toThrow(/Access token inválido/)
    expect(authSession.isAuthenticated()).toBe(false)
  })

  it('calcula tempo restante e expiração com janela de buffer preservando refreshToken até invalidação explícita', () => {
    let nowMs = 1_000_000
    const manager = createAuthSessionManager({
      channelName: null,
      now: () => nowMs,
    })

    expect(manager.getRemainingTimeMs()).toBe(0)
    expect(manager.isAccessTokenExpired()).toBe(true)

    manager.setSession({
      ...sampleTokenPayload,
      expiresIn: 60,
    })

    expect(manager.getRemainingTimeMs()).toBe(60_000)
    expect(manager.isAccessTokenExpired()).toBe(false)
    expect(manager.isAccessTokenExpired(30_000)).toBe(false)

    nowMs = 1_035_000
    expect(manager.getRemainingTimeMs()).toBe(25_000)
    expect(manager.isAccessTokenExpired()).toBe(false)
    expect(manager.isAccessTokenExpired(30_000)).toBe(true)

    nowMs = 1_060_000
    expect(manager.getRemainingTimeMs()).toBe(0)
    expect(manager.isAccessTokenExpired()).toBe(true)
    expect(manager.isAuthenticated()).toBe(true)
    expect(manager.getRefreshToken()).toBe('rft-opaque-token')

    manager.destroy()
  })

  it('atualiza dados do usuário sem descartar tokens e dispara evento user_updated', () => {
    const events: string[] = []
    const unsubscribe = authSession.subscribeEvents((event) => {
      events.push(event.type)
    })

    expect(authSession.updateUser(sampleTokenPayload.usuario)).toBeNull()

    authSession.setSession(sampleTokenPayload)
    const updated = authSession.updateUser((current) => ({
      ...current,
      nome: 'Ana Clara Silva',
    }))

    expect(updated?.nome).toBe('Ana Clara Silva')
    expect(authSession.getUser()?.nome).toBe('Ana Clara Silva')
    expect(authSession.getAccessToken()).toBe('jwt-access-token')
    expect(events).toEqual(['established', 'user_updated'])

    unsubscribe()
  })

  it('integra initializeAuthHttpClient ao httpClient adicionando e removendo Authorization Bearer conforme a sessão', async () => {
    initializeAuthHttpClient()

    const seenAuthorizationHeaders: Array<string | undefined> = []
    const adapter: AxiosAdapter = async (config) => {
      const authHeader = config.headers.get('Authorization')
      seenAuthorizationHeaders.push(
        typeof authHeader === 'string' ? authHeader : undefined,
      )
      return {
        data: JSON.stringify({ ok: true }),
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
        config,
      }
    }
    httpClient.defaults.adapter = adapter

    await httpClient.get('/semestres')
    authSession.setSession(sampleTokenPayload)
    await httpClient.get('/semestres')
    authSession.clear()
    await httpClient.get('/semestres')

    expect(seenAuthorizationHeaders).toEqual([
      undefined,
      'Bearer jwt-access-token',
      undefined,
    ])
  })

  it('encerra sessão ativa, limpa cache do QueryClient e notifica usuário em 401 autenticado (sem disparar falso expirado quando anônimo)', async () => {
    const queryClient = createQueryClient()
    const onUnauthorized = vi.fn()
    initializeAuthHttpClient({ onUnauthorized })
    const unbind = bindAuthSessionEffects(queryClient)

    httpClient.defaults.adapter = async (config) => {
      throw new AxiosError(
        'Request failed with status code 401',
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        {
          data: JSON.stringify({
            status: 401,
            detail: 'Token inválido ou expirado.',
            code: 'AUTHENTICATION_FAILED',
          }),
          status: 401,
          statusText: 'Unauthorized',
          headers: new AxiosHeaders({
            'Content-Type': 'application/problem+json',
          }),
          config,
        },
      )
    }

    // 401 enquanto anônimo (ex.: tentativa de login) não deve notificar "Sessão expirada"
    await expect(
      httpClient.post('/auth/login', { email: 'a@b.com', senha: 'err' }),
    ).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).not.toHaveBeenCalled()
    expect(toastStore.getSnapshot()).toHaveLength(0)

    // 401 estando autenticado deve limpar sessão, cache e alertar o usuário
    queryClient.setQueryData(['semestres'], [{ id: '2026-2' }])
    authSession.setSession(sampleTokenPayload)

    await expect(httpClient.get('/semestres')).rejects.toMatchObject({
      status: 401,
      code: 'AUTHENTICATION_FAILED',
    })

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(authSession.isAuthenticated()).toBe(false)
    expect(authSession.getAccessToken()).toBeNull()
    expect(queryClient.getQueryData(['semestres'])).toBeUndefined()
    expect(
      toastStore.getSnapshot().some((item) => item.title === 'Sessão expirada'),
    ).toBe(true)

    unbind()
    queryClient.clear()
  })

  it('limpa cache do QueryClient ao trocar de usuário autenticado', () => {
    const queryClient = createQueryClient()
    const unbind = bindAuthSessionEffects(queryClient)

    authSession.setSession(sampleTokenPayload)
    queryClient.setQueryData(['dashboard'], { pendencias: 4 })

    authSession.setSession(secondUserTokenPayload)
    expect(queryClient.getQueryData(['dashboard'])).toBeUndefined()
    expect(authSession.getUser()?.email).toBe('bruno.costa@uniflow.edu')

    unbind()
    queryClient.clear()
  })

  it('sincroniza encerramento e troca de usuário entre abas via BroadcastChannel sem transmitir tokens', async () => {
    const channelName = `uniflow-auth-test-${Date.now()}`
    const tabA = createAuthSessionManager({ channelName, tabId: 'tab-a' })
    const tabB = createAuthSessionManager({ channelName, tabId: 'tab-b' })
    const postSpy = vi.spyOn(BroadcastChannel.prototype, 'postMessage')

    try {
      tabA.setSession(sampleTokenPayload)
      tabB.setSession(sampleTokenPayload)

      tabA.clear('logout')

      await waitFor(() => {
        expect(tabB.isAuthenticated()).toBe(false)
      })

      for (const [message] of postSpy.mock.calls) {
        const serialized = JSON.stringify(message)
        expect(serialized).not.toContain('jwt-access-token')
        expect(serialized).not.toContain('rft-opaque-token')
      }

      // Se a aba B tinha usuário 1 e a aba A autentica usuário 2, aba B descarta sessão antiga
      tabB.setSession(sampleTokenPayload)
      tabA.setSession(secondUserTokenPayload)

      await waitFor(() => {
        expect(tabB.isAuthenticated()).toBe(false)
      })
    } finally {
      tabA.destroy()
      tabB.destroy()
    }
  })

  it('renova accessToken e rotaciona refreshToken em memória via POST /auth/refresh ao receber 401 concorrente sem limpar cache', async () => {
    localStorage.clear()
    sessionStorage.clear()

    const queryClient = createQueryClient()
    const unbind = bindAuthSessionEffects(queryClient)
    queryClient.setQueryData(['cached-semestres'], ['2026.2'])
    authSession.setSession(sampleTokenPayload)

    let refreshCallCount = 0
    const rotatedPayload: AuthTokenResponse = {
      ...sampleTokenPayload,
      accessToken: 'jwt-rotated-2',
      refreshToken: 'rft-rotated-2',
    }

    httpClient.defaults.adapter = async (config) => {
      if (config.url === '/auth/refresh') {
        refreshCallCount += 1
        expect(config.headers.has('Authorization')).toBe(false)
        expect(JSON.parse(String(config.data))).toEqual({
          refreshToken: 'rft-opaque-token',
        })
        await new Promise((resolve) => setTimeout(resolve, 10))
        return {
          data: JSON.stringify(rotatedPayload),
          status: 200,
          statusText: 'OK',
          headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
          config,
        }
      }

      const authHeader = config.headers.get('Authorization')
      if (authHeader !== 'Bearer jwt-rotated-2') {
        throw new AxiosError(
          'Expired JWT',
          AxiosError.ERR_BAD_REQUEST,
          config,
          undefined,
          {
            data: JSON.stringify({
              status: 401,
              detail: 'Token expirado.',
              code: 'AUTHENTICATION_FAILED',
            }),
            status: 401,
            statusText: 'Unauthorized',
            headers: new AxiosHeaders({
              'Content-Type': 'application/problem+json',
            }),
            config,
          },
        )
      }

      return {
        data: JSON.stringify({ endpoint: config.url }),
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
        config,
      }
    }

    const [semestresRes, disciplinasRes] = await Promise.all([
      httpClient.get<{ endpoint: string }>('/semestres'),
      httpClient.get<{ endpoint: string }>('/disciplinas'),
    ])

    expect(refreshCallCount).toBe(1)
    expect(semestresRes.data).toEqual({ endpoint: '/semestres' })
    expect(disciplinasRes.data).toEqual({ endpoint: '/disciplinas' })
    expect(authSession.getAccessToken()).toBe('jwt-rotated-2')
    expect(authSession.getRefreshToken()).toBe('rft-rotated-2')
    expect(queryClient.getQueryData(['cached-semestres'])).toEqual(['2026.2'])
    expect(toastStore.getSnapshot()).toHaveLength(0)
    expect(localStorage).toHaveLength(0)
    expect(sessionStorage).toHaveLength(0)

    unbind()
    queryClient.clear()
  })

  it('renova proativamente antes de disparar requisição quando o accessToken entra na janela de expiração', async () => {
    let nowMs = 1_000_000
    const customManager = createAuthSessionManager({
      channelName: null,
      now: () => nowMs,
    })

    try {
      initializeAuthHttpClient({ session: customManager })
      customManager.setSession({
        ...sampleTokenPayload,
        expiresIn: 900,
      })

      // Faltam 20s para expirar (dentro do buffer padrão de 30s)
      nowMs = 1_880_000

      const requestOrder: string[] = []
      httpClient.defaults.adapter = async (config) => {
        requestOrder.push(`${config.method}:${config.url}`)
        if (config.url === '/auth/refresh') {
          return {
            data: JSON.stringify({
              ...sampleTokenPayload,
              accessToken: 'jwt-proactive-2',
              refreshToken: 'rft-proactive-2',
              expiresIn: 900,
            }),
            status: 200,
            statusText: 'OK',
            headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
            config,
          }
        }

        expect(config.headers.get('Authorization')).toBe(
          'Bearer jwt-proactive-2',
        )
        return {
          data: JSON.stringify({ ok: true }),
          status: 200,
          statusText: 'OK',
          headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
          config,
        }
      }

      const response = await httpClient.get<{ ok: boolean }>('/atividades')
      expect(response.data).toEqual({ ok: true })
      expect(requestOrder).toEqual(['post:/auth/refresh', 'get:/atividades'])
      expect(customManager.getAccessToken()).toBe('jwt-proactive-2')
      expect(customManager.getRefreshToken()).toBe('rft-proactive-2')
    } finally {
      customManager.destroy()
    }
  })

  it('preserva refreshToken em falha transitória de rede no refresh e não ressuscita sessão encerrada durante refresh em voo', async () => {
    authSession.setSession(sampleTokenPayload)

    httpClient.defaults.adapter = async (config) => {
      if (config.url === '/auth/refresh') {
        throw new AxiosError('Offline', AxiosError.ERR_NETWORK, config)
      }
      throw new AxiosError(
        'Unauthorized',
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        {
          data: JSON.stringify({
            status: 401,
            detail: 'Token expirado.',
            code: 'AUTHENTICATION_FAILED',
          }),
          status: 401,
          statusText: 'Unauthorized',
          headers: new AxiosHeaders({
            'Content-Type': 'application/problem+json',
          }),
          config,
        },
      )
    }

    await expect(httpClient.get('/semestres')).rejects.toMatchObject({
      isNetworkError: true,
    })
    expect(authSession.isAuthenticated()).toBe(true)
    expect(authSession.getRefreshToken()).toBe('rft-opaque-token')

    // Corrida com logout explícito enquanto refresh está em andamento
    let resolveDeferredRefresh: ((value: AuthTokenResponse) => void) | undefined
    const pendingRefresh = refreshAuthSession({
      refreshTokensFn: () =>
        new Promise<AuthTokenResponse>((resolve) => {
          resolveDeferredRefresh = resolve
        }),
    })

    authSession.clear('logout')
    resolveDeferredRefresh?.({
      ...sampleTokenPayload,
      accessToken: 'jwt-should-not-restore',
      refreshToken: 'rft-should-not-restore',
    })

    expect(await pendingRefresh).toBeNull()
    expect(authSession.isAuthenticated()).toBe(false)
    expect(authSession.getRefreshToken()).toBeNull()
  })
})
