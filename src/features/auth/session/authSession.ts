import type { QueryClient } from '@tanstack/react-query'
import { refreshAuthTokens } from '@/features/auth/services/authService.ts'
import type {
  AuthTokenResponse,
  AuthUserResponse,
  RefreshTokenRequest,
} from '@/features/auth/types/authTypes.ts'
import { toast } from '@/lib/toast.ts'
import {
  configureHttpClientAuth,
  type HttpClientError,
} from '@/services/httpClient.ts'

export const DEFAULT_EXPIRY_BUFFER_MS = 30_000
export const AUTH_SESSION_CHANNEL_NAME = 'uniflow-auth-session'

export type AuthSessionStatus = 'anonymous' | 'authenticated'

export type AuthSessionEndReason =
  'manual' | 'logout' | 'expired' | 'unauthorized' | 'sync'

export interface AuthSessionState {
  readonly accessToken: string
  readonly refreshToken: string
  readonly expiresIn: number
  readonly expiresAt: number
  readonly tokenType: string
  readonly user: AuthUserResponse
}

export type AuthSessionEvent =
  | {
      type: 'established'
      session: AuthSessionState
      switchedUser: boolean
    }
  | {
      type: 'user_updated'
      session: AuthSessionState
    }
  | {
      type: 'cleared'
      reason: AuthSessionEndReason
      previousUser: AuthUserResponse
    }

type AuthSessionListener = () => void
type AuthSessionEventListener = (event: AuthSessionEvent) => void

type SessionBroadcastMessage =
  | {
      type: 'SESSION_CLEARED'
      reason: AuthSessionEndReason
      originTabId: string
    }
  | {
      type: 'SESSION_USER_CHANGED'
      userId: string
      originTabId: string
    }

export interface CreateAuthSessionManagerOptions {
  now?: () => number
  channelName?: string | null
  tabId?: string
}

function createTabId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  return `tab-${Math.random().toString(36).slice(2)}-${Date.now()}`
}

function freezeSessionState(state: AuthSessionState): AuthSessionState {
  return Object.freeze({
    ...state,
    user: Object.freeze({ ...state.user }),
  })
}

function isSessionBroadcastMessage(
  value: unknown,
): value is SessionBroadcastMessage {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Partial<SessionBroadcastMessage>
  if (typeof candidate.originTabId !== 'string') {
    return false
  }
  if (candidate.type === 'SESSION_CLEARED') {
    return typeof candidate.reason === 'string'
  }
  if (candidate.type === 'SESSION_USER_CHANGED') {
    return typeof candidate.userId === 'string'
  }
  return false
}

export interface AuthSessionManager {
  subscribe: (listener: AuthSessionListener) => () => void
  subscribeEvents: (listener: AuthSessionEventListener) => () => void
  getSnapshot: () => AuthSessionState | null
  getServerSnapshot: () => AuthSessionState | null
  getStatus: () => AuthSessionStatus
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  getAuthorizationHeader: () => string | null
  getUser: () => AuthUserResponse | null
  getRemainingTimeMs: () => number
  isAccessTokenExpired: (bufferMs?: number) => boolean
  isAuthenticated: () => boolean
  setSession: (response: AuthTokenResponse) => AuthSessionState
  updateUser: (
    updater:
      AuthUserResponse | ((current: AuthUserResponse) => AuthUserResponse),
  ) => AuthUserResponse | null
  clear: (reason?: AuthSessionEndReason) => boolean
  destroy: () => void
}

export function createAuthSessionManager(
  options: CreateAuthSessionManagerOptions = {},
): AuthSessionManager {
  const getNow = options.now ?? (() => Date.now())
  const tabId = options.tabId ?? createTabId()
  const channelName =
    options.channelName === undefined
      ? AUTH_SESSION_CHANNEL_NAME
      : options.channelName

  let currentSession: AuthSessionState | null = null
  const storeListeners = new Set<AuthSessionListener>()
  const eventListeners = new Set<AuthSessionEventListener>()

  const channel =
    channelName && typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel(channelName)
      : null

  if (channel) {
    ;(channel as BroadcastChannel & { unref?: () => void }).unref?.()
  }

  function notifyStore(): void {
    for (const listener of storeListeners) {
      listener()
    }
  }

  function emitEvent(event: AuthSessionEvent): void {
    for (const listener of eventListeners) {
      listener(event)
    }
  }

  function postSyncMessage(message: SessionBroadcastMessage): void {
    try {
      channel?.postMessage(message)
    } catch {
      // Ignore closed channel or serialization errors in restricted contexts.
    }
  }

  function clearInternal(
    reason: AuthSessionEndReason,
    broadcast: boolean,
  ): boolean {
    if (currentSession === null) {
      return false
    }

    const previousUser = currentSession.user
    currentSession = null
    notifyStore()
    emitEvent({ type: 'cleared', reason, previousUser })

    if (broadcast) {
      postSyncMessage({
        type: 'SESSION_CLEARED',
        reason,
        originTabId: tabId,
      })
    }

    return true
  }

  if (channel) {
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (!isSessionBroadcastMessage(event.data)) {
        return
      }
      if (event.data.originTabId === tabId) {
        return
      }
      if (event.data.type === 'SESSION_CLEARED') {
        clearInternal('sync', false)
        return
      }
      if (
        event.data.type === 'SESSION_USER_CHANGED' &&
        currentSession !== null &&
        currentSession.user.id !== event.data.userId
      ) {
        clearInternal('sync', false)
      }
    }
  }

  const getAccessToken = (): string | null =>
    currentSession?.accessToken ?? null

  const getRefreshToken = (): string | null =>
    currentSession && currentSession.refreshToken.length > 0
      ? currentSession.refreshToken
      : null

  const isAuthenticated = (): boolean =>
    currentSession !== null && currentSession.accessToken.length > 0

  const isAccessTokenExpired = (bufferMs = 0): boolean => {
    if (currentSession === null) {
      return true
    }
    const safeBuffer = Number.isFinite(bufferMs) && bufferMs > 0 ? bufferMs : 0
    return getNow() + safeBuffer >= currentSession.expiresAt
  }

  const clear = (reason: AuthSessionEndReason = 'manual'): boolean =>
    clearInternal(reason, reason !== 'sync')

  return {
    subscribe(listener) {
      storeListeners.add(listener)
      return () => {
        storeListeners.delete(listener)
      }
    },

    subscribeEvents(listener) {
      eventListeners.add(listener)
      return () => {
        eventListeners.delete(listener)
      }
    },

    getSnapshot() {
      return currentSession
    },

    getServerSnapshot() {
      return null
    },

    getStatus() {
      return isAuthenticated() ? 'authenticated' : 'anonymous'
    },

    getAccessToken,

    getRefreshToken,

    getAuthorizationHeader() {
      if (!currentSession) {
        return null
      }
      return `${currentSession.tokenType} ${currentSession.accessToken}`
    },

    getUser() {
      return currentSession?.user ?? null
    },

    getRemainingTimeMs() {
      if (!currentSession) {
        return 0
      }
      return Math.max(0, currentSession.expiresAt - getNow())
    },

    isAccessTokenExpired,

    isAuthenticated,

    setSession(response) {
      const accessToken = response.accessToken.trim()
      if (accessToken.length === 0) {
        throw new Error('Access token inválido na resposta de autenticação.')
      }

      const previousUser = currentSession?.user ?? null
      const switchedUser =
        previousUser !== null && previousUser.id !== response.usuario.id

      const validExpiresIn =
        Number.isFinite(response.expiresIn) && response.expiresIn > 0
          ? response.expiresIn
          : 0
      const expiresAt = getNow() + validExpiresIn * 1000

      currentSession = freezeSessionState({
        accessToken,
        refreshToken: response.refreshToken.trim(),
        expiresIn: validExpiresIn,
        expiresAt,
        tokenType: response.tokenType.trim() || 'Bearer',
        user: response.usuario,
      })

      notifyStore()
      emitEvent({
        type: 'established',
        session: currentSession,
        switchedUser,
      })
      postSyncMessage({
        type: 'SESSION_USER_CHANGED',
        userId: currentSession.user.id,
        originTabId: tabId,
      })

      return currentSession
    },

    updateUser(updater) {
      if (currentSession === null) {
        return null
      }

      const nextUser =
        typeof updater === 'function' ? updater(currentSession.user) : updater

      currentSession = freezeSessionState({
        ...currentSession,
        user: nextUser,
      })

      notifyStore()
      emitEvent({ type: 'user_updated', session: currentSession })

      return currentSession.user
    },

    clear,

    destroy() {
      currentSession = null
      storeListeners.clear()
      eventListeners.clear()
      channel?.close()
    },
  }
}

function resolveDefaultChannelName(): string {
  if (import.meta.env.MODE === 'test') {
    return `${AUTH_SESSION_CHANNEL_NAME}-${createTabId()}`
  }
  return AUTH_SESSION_CHANNEL_NAME
}

export const authSession: AuthSessionManager = createAuthSessionManager({
  channelName: resolveDefaultChannelName(),
})

const inFlightSessionRefreshes = new WeakMap<
  AuthSessionManager,
  Promise<AuthSessionState | null>
>()

export function shouldProactivelyRefreshSession(
  manager: AuthSessionManager = authSession,
  bufferMs: number = DEFAULT_EXPIRY_BUFFER_MS,
): boolean {
  const snapshot = manager.getSnapshot()
  if (!snapshot || snapshot.refreshToken.length === 0) {
    return false
  }
  if (snapshot.expiresIn <= 0) {
    return false
  }
  const halfLifetimeMs = Math.floor((snapshot.expiresIn * 1000) / 2)
  const effectiveBufferMs = Math.min(Math.max(0, bufferMs), halfLifetimeMs)
  return manager.isAccessTokenExpired(effectiveBufferMs)
}

export interface RefreshAuthSessionOptions {
  session?: AuthSessionManager
  refreshTokensFn?: (payload: RefreshTokenRequest) => Promise<AuthTokenResponse>
}

export function refreshAuthSession(
  options: RefreshAuthSessionOptions = {},
): Promise<AuthSessionState | null> {
  const manager = options.session ?? authSession
  const existingPromise = inFlightSessionRefreshes.get(manager)
  if (existingPromise) {
    return existingPromise
  }

  const refreshToken = manager.getRefreshToken()
  if (!refreshToken) {
    return Promise.resolve(null)
  }

  const performRefresh = options.refreshTokensFn ?? refreshAuthTokens
  const refreshPromise = (async () => {
    try {
      const tokenResponse = await performRefresh({ refreshToken })
      if (manager.getRefreshToken() === null) {
        return null
      }
      return manager.setSession(tokenResponse)
    } finally {
      inFlightSessionRefreshes.delete(manager)
    }
  })()

  inFlightSessionRefreshes.set(manager, refreshPromise)
  return refreshPromise
}

export interface InitializeAuthHttpClientOptions {
  session?: AuthSessionManager
  refreshTokensFn?: (payload: RefreshTokenRequest) => Promise<AuthTokenResponse>
  proactiveRefreshBufferMs?: number
  onUnauthorized?: (error: HttpClientError) => void
}

export function initializeAuthHttpClient(
  options: InitializeAuthHttpClientOptions = {},
): void {
  const manager = options.session ?? authSession
  const bufferMs = options.proactiveRefreshBufferMs ?? DEFAULT_EXPIRY_BUFFER_MS

  configureHttpClientAuth({
    getAccessToken: () => manager.getAccessToken(),
    shouldRefreshToken: () =>
      shouldProactivelyRefreshSession(manager, bufferMs),
    refreshAccessToken: async () => {
      const refreshedSession = await refreshAuthSession({
        session: manager,
        refreshTokensFn: options.refreshTokensFn,
      })
      return refreshedSession?.accessToken ?? null
    },
    onUnauthorized: (error) => {
      const hadActiveSession = manager.clear('unauthorized')
      if (hadActiveSession) {
        options.onUnauthorized?.(error)
      }
    },
  })
}

export interface BindAuthSessionEffectsOptions {
  session?: AuthSessionManager
  onSessionExpired?: (
    reason: Extract<AuthSessionEndReason, 'unauthorized' | 'expired'>,
  ) => void
}

export function bindAuthSessionEffects(
  queryClient: QueryClient,
  options: BindAuthSessionEffectsOptions = {},
): () => void {
  const manager = options.session ?? authSession

  return manager.subscribeEvents((event) => {
    if (event.type === 'cleared') {
      queryClient.clear()
      if (event.reason === 'unauthorized' || event.reason === 'expired') {
        if (options.onSessionExpired) {
          options.onSessionExpired(event.reason)
        } else {
          toast.warning('Sessão expirada', {
            description: 'Entre novamente para continuar usando o UniFlow.',
          })
        }
      }
      return
    }

    if (event.type === 'established' && event.switchedUser) {
      queryClient.clear()
    }
  })
}

initializeAuthHttpClient()
