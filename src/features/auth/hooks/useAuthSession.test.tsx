import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { afterEach, describe, expect, it } from 'vitest'
import App from '@/app/App.tsx'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession.ts'
import {
  authSession,
  initializeAuthHttpClient,
} from '@/features/auth/session/authSession.ts'
import type { AuthTokenResponse } from '@/features/auth/types/authTypes.ts'
import { queryClient } from '@/lib/queryClient.ts'
import { httpClient } from '@/services/httpClient.ts'

const mockTokenResponse: AuthTokenResponse = {
  accessToken: 'jwt-access-token',
  refreshToken: 'rft-opaque-token',
  expiresIn: 900,
  tokenType: 'Bearer',
  usuario: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nome: 'Ana Silva',
    email: 'ana@ufpb.br',
    status: 'ATIVO',
    createdAt: '2026-11-25T11:50:00Z',
    updatedAt: '2026-11-25T11:50:00Z',
  },
}

function SessionProbe() {
  const { status, isAuthenticated, user, accessToken, clearSession } =
    useAuthSession()

  return (
    <div>
      <p data-testid="session-status">{status}</p>
      <p data-testid="session-auth">{String(isAuthenticated)}</p>
      <p data-testid="session-user">{user?.nome ?? 'nenhum'}</p>
      <p data-testid="session-token">{accessToken ?? 'sem-token'}</p>
      <button type="button" onClick={() => clearSession('logout')}>
        Encerrar sessão
      </button>
    </div>
  )
}

describe('useAuthSession e integração com App', () => {
  const originalAdapter = httpClient.defaults.adapter

  afterEach(() => {
    httpClient.defaults.adapter = originalAdapter
    authSession.clear()
    initializeAuthHttpClient()
    queryClient.clear()
  })

  it('reage a setSession, updateUser e clearSession em tempo real', async () => {
    const user = userEvent.setup()
    render(<SessionProbe />)

    expect(screen.getByTestId('session-status')).toHaveTextContent('anonymous')
    expect(screen.getByTestId('session-auth')).toHaveTextContent('false')
    expect(screen.getByTestId('session-user')).toHaveTextContent('nenhum')

    act(() => {
      authSession.setSession(mockTokenResponse)
    })

    expect(screen.getByTestId('session-status')).toHaveTextContent(
      'authenticated',
    )
    expect(screen.getByTestId('session-auth')).toHaveTextContent('true')
    expect(screen.getByTestId('session-user')).toHaveTextContent('Ana Silva')
    expect(screen.getByTestId('session-token')).toHaveTextContent(
      'jwt-access-token',
    )

    act(() => {
      authSession.updateUser((current) => ({
        ...current,
        nome: 'Ana Clara Silva',
      }))
    })

    expect(screen.getByTestId('session-user')).toHaveTextContent(
      'Ana Clara Silva',
    )
    expect(screen.getByTestId('session-token')).toHaveTextContent(
      'jwt-access-token',
    )

    await user.click(screen.getByRole('button', { name: 'Encerrar sessão' }))

    expect(screen.getByTestId('session-status')).toHaveTextContent('anonymous')
    expect(screen.getByTestId('session-auth')).toHaveTextContent('false')
    expect(screen.getByTestId('session-user')).toHaveTextContent('nenhum')
    expect(screen.getByTestId('session-token')).toHaveTextContent('sem-token')
  })

  it('App conecta efeitos de sessão ao queryClient global limpando cache e exibindo aviso quando ocorre 401 autenticado', async () => {
    httpClient.defaults.adapter = async (config) => {
      throw new AxiosError(
        'Unauthorized',
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        {
          data: JSON.stringify({
            status: 401,
            detail: 'Sessão expirada no servidor.',
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

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Ambiente base configurado' }),
    ).toBeInTheDocument()

    act(() => {
      authSession.setSession(mockTokenResponse)
      queryClient.setQueryData(['disciplinas'], [{ id: 'algoritmos' }])
    })

    await expect(httpClient.get('/disciplinas')).rejects.toMatchObject({
      status: 401,
    })

    expect(authSession.isAuthenticated()).toBe(false)
    expect(queryClient.getQueryData(['disciplinas'])).toBeUndefined()
    expect(await screen.findByText('Sessão expirada')).toBeInTheDocument()
  })
})
