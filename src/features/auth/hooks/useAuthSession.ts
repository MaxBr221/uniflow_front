import { useSyncExternalStore } from 'react'
import {
  authSession,
  type AuthSessionEndReason,
  type AuthSessionManager,
  type AuthSessionState,
  type AuthSessionStatus,
} from '@/features/auth/session/authSession.ts'
import type { AuthUserResponse } from '@/features/auth/types/authTypes.ts'

export interface UseAuthSessionResult {
  session: AuthSessionState | null
  user: AuthUserResponse | null
  status: AuthSessionStatus
  isAuthenticated: boolean
  accessToken: string | null
  expiresAt: number | null
  isAccessTokenExpired: (bufferMs?: number) => boolean
  clearSession: (reason?: AuthSessionEndReason) => boolean
}

export function useAuthSession(
  manager: AuthSessionManager = authSession,
): UseAuthSessionResult {
  const session = useSyncExternalStore(
    manager.subscribe,
    manager.getSnapshot,
    manager.getServerSnapshot,
  )

  const isAuthenticated = session !== null && session.accessToken.length > 0

  return {
    session,
    user: session?.user ?? null,
    status: isAuthenticated ? 'authenticated' : 'anonymous',
    isAuthenticated,
    accessToken: session?.accessToken ?? null,
    expiresAt: session?.expiresAt ?? null,
    isAccessTokenExpired: manager.isAccessTokenExpired,
    clearSession: manager.clear,
  }
}
