import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { MemoryRouter, Route, Routes, type InitialEntry } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BaseHomeView } from '@/app/RouteViews.tsx'
import { LoginPage } from '@/features/auth/pages/LoginPage.tsx'
import { authSession } from '@/features/auth/session/authSession.ts'
import type { AuthTokenResponse } from '@/features/auth/types/authTypes.ts'
import { httpClient } from '@/services/httpClient.ts'
import { renderWithQueryClient } from '@/test/renderWithProviders.tsx'

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

function renderLoginRoutes(
  initialEntries: InitialEntry[] = ['/login'],
  props?: Parameters<typeof LoginPage>[0],
) {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage {...props} />} />
        <Route path="/" element={<BaseHomeView />} />
        <Route path="/dashboard" element={<h1>Painel acadêmico</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

function createJsonResponse(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosResponse {
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
    AxiosError.ERR_BAD_REQUEST,
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

describe('LoginPage', () => {
  const originalAdapter = httpClient.defaults.adapter

  afterEach(() => {
    httpClient.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('renderiza campos de login, pré-preenche e-mail pós-cadastro, alterna senha e links', async () => {
    const user = userEvent.setup()
    renderLoginRoutes([
      { pathname: '/login', state: { registeredEmail: 'ana@ufpb.br' } },
    ])

    expect(
      screen.getByRole('heading', { level: 1, name: 'Entrar no UniFlow' }),
    ).toBeInTheDocument()

    const emailInput = screen.getByLabelText(/E-mail/i)
    const passwordInput = screen.getByLabelText(/^Senha/i)

    expect(emailInput).toHaveValue('ana@ufpb.br')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autocomplete', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    expect(
      screen.getByRole('link', { name: 'Esqueci minha senha' }),
    ).toHaveAttribute('href', '/recuperar-senha')
    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/cadastro',
    )
    expect(
      screen.getByRole('link', { name: 'Voltar à página inicial' }),
    ).toHaveAttribute('href', '/')
  }, 15_000)

  it('valida e-mail obrigatório, formato inválido e senha obrigatória antes de disparar HTTP', async () => {
    const adapterSpy = vi.fn<AxiosAdapter>()
    httpClient.defaults.adapter = adapterSpy
    const { user } = renderLoginRoutes()

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('E-mail é obrigatório.')).toBeInTheDocument()
    expect(screen.getByText('Senha é obrigatória.')).toBeInTheDocument()
    expect(adapterSpy).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/E-mail/i), 'email-invalido')
    await user.type(screen.getByLabelText(/^Senha/i), '1234')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByText('Informe um e-mail válido.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/E-mail/i)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(adapterSpy).not.toHaveBeenCalled()
  }, 15_000)

  it('integra login via pipeline Axios POST /auth/login, salva sessão em memória e redireciona com segurança', async () => {
    localStorage.clear()
    sessionStorage.clear()

    const adapterSpy = vi.fn<AxiosAdapter>(async (config) =>
      createJsonResponse(config, 200, mockTokenResponse),
    )
    httpClient.defaults.adapter = adapterSpy

    const { user } = renderLoginRoutes([
      { pathname: '/login', state: { from: '/dashboard' } },
    ])

    await user.type(screen.getByLabelText(/E-mail/i), '  ANA@UFPB.BR ')
    await user.type(screen.getByLabelText(/^Senha/i), 'UniFlow@2026')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(adapterSpy).toHaveBeenCalledTimes(1)
    })

    const sentConfig = adapterSpy.mock.calls[0]?.[0]
    expect(sentConfig?.method).toBe('post')
    expect(sentConfig?.url).toBe('/auth/login')
    expect(JSON.parse(String(sentConfig?.data))).toEqual({
      email: 'ana@ufpb.br',
      senha: 'UniFlow@2026',
    })

    expect(
      await screen.findByText('Login realizado com sucesso!'),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Painel acadêmico' }),
    ).toBeInTheDocument()

    expect(authSession.isAuthenticated()).toBe(true)
    expect(authSession.getAccessToken()).toBe('jwt-access-token')
    expect(authSession.getRefreshToken()).toBe('rft-opaque-token')
    expect(localStorage).toHaveLength(0)
    expect(sessionStorage).toHaveLength(0)
  }, 15_000)

  it('bloqueia open redirect em state.from externo ou protocol-relative redirecionando para /', async () => {
    httpClient.defaults.adapter = vi.fn<AxiosAdapter>(async (config) =>
      createJsonResponse(config, 200, mockTokenResponse),
    )

    const { user, unmount } = renderLoginRoutes([
      { pathname: '/login', state: { from: 'https://evil.com/phishing' } },
    ])

    await user.type(screen.getByLabelText(/E-mail/i), 'ana@ufpb.br')
    await user.type(screen.getByLabelText(/^Senha/i), 'UniFlow@2026')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByRole('heading', { name: 'Ambiente base configurado' }),
    ).toBeInTheDocument()
    unmount()
    authSession.clear()

    const secondRender = renderLoginRoutes([
      { pathname: '/login', state: { from: '//evil.com/phishing' } },
    ])

    await secondRender.user.type(
      screen.getByLabelText(/E-mail/i),
      'ana@ufpb.br',
    )
    await secondRender.user.type(
      screen.getByLabelText(/^Senha/i),
      'UniFlow@2026',
    )
    await secondRender.user.click(
      screen.getByRole('button', { name: 'Entrar' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Ambiente base configurado' }),
    ).toBeInTheDocument()
  }, 20_000)

  it('normaliza 401 e 400 RFC 7807 reais da API, limpa alerta anterior ao reenviar e mapeia fieldErrors', async () => {
    const adapterSpy = vi
      .fn<AxiosAdapter>()
      .mockImplementationOnce(async (config) => {
        throw createProblemError(config, 401, {
          status: 401,
          detail: 'Credenciais inválidas.',
          code: 'AUTHENTICATION_FAILED',
        })
      })
      .mockImplementationOnce(async (config) => {
        throw createProblemError(config, 400, {
          status: 400,
          detail: 'Dados inválidos.',
          code: 'VALIDATION_ERROR',
          fieldErrors: [
            { field: 'senha', message: 'senha nao deve estar em branco' },
          ],
        })
      })
    httpClient.defaults.adapter = adapterSpy

    const { user } = renderLoginRoutes()

    await user.type(screen.getByLabelText(/E-mail/i), 'ana@ufpb.br')
    await user.type(screen.getByLabelText(/^Senha/i), 'SenhaErrada1!')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciais inválidas.',
    )
    expect(adapterSpy).toHaveBeenCalledTimes(1)
    expect(authSession.isAuthenticated()).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByText('senha nao deve estar em branco'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Credenciais inválidas.')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^Senha/i)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  }, 15_000)

  it('bloqueia reenvio duplicado e desabilita controles enquanto requisição está em andamento', async () => {
    let resolveRequest: ((value: AxiosResponse) => void) | undefined
    let pendingConfig: InternalAxiosRequestConfig | undefined

    const adapterSpy = vi.fn<AxiosAdapter>(
      (config) =>
        new Promise<AxiosResponse>((resolve) => {
          pendingConfig = config
          resolveRequest = resolve
        }),
    )
    httpClient.defaults.adapter = adapterSpy

    const { user } = renderLoginRoutes()

    await user.type(screen.getByLabelText(/E-mail/i), 'ana@ufpb.br')
    await user.type(screen.getByLabelText(/^Senha/i), 'UniFlow@2026')

    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(adapterSpy).toHaveBeenCalledTimes(1)
    })

    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText(/E-mail/i)).toBeDisabled()
    expect(screen.getByLabelText(/^Senha/i)).toBeDisabled()

    await user.click(submitButton)
    expect(adapterSpy).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveRequest?.(
        createJsonResponse(
          pendingConfig as InternalAxiosRequestConfig,
          200,
          mockTokenResponse,
        ),
      )
    })

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Ambiente base configurado' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument()
  }, 15_000)
})
