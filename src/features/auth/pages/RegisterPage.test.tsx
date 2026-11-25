import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '@/features/auth/pages/LoginPage.tsx'
import { RegisterPage } from '@/features/auth/pages/RegisterPage.tsx'
import type { AuthUserResponse } from '@/features/auth/types/authTypes.ts'
import { httpClient } from '@/services/httpClient.ts'
import { renderWithQueryClient } from '@/test/renderWithProviders.tsx'

function renderRegisterRoutes(
  initialEntries: string[] = ['/cadastro'],
  props?: Parameters<typeof RegisterPage>[0],
) {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/cadastro" element={<RegisterPage {...props} />} />
        <Route path="/login" element={<LoginPage />} />
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

describe('RegisterPage', () => {
  const originalAdapter = httpClient.defaults.adapter

  afterEach(() => {
    httpClient.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('renderiza campos do formulário de cadastro, alternância de senha e links de navegação', async () => {
    const user = userEvent.setup()
    renderRegisterRoutes()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Criar conta' }),
    ).toBeInTheDocument()

    const nameInput = screen.getByLabelText(/Nome completo/i)
    const emailInput = screen.getByLabelText(/E-mail/i)
    const passwordInput = screen.getByLabelText(/^Senha/i)
    const confirmPasswordInput = screen.getByLabelText(/Confirmar senha/i)

    expect(nameInput).toHaveAttribute('autocomplete', 'name')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')

    const toggleButtons = screen.getAllByRole('button', {
      name: 'Mostrar senha',
    })
    expect(toggleButtons).toHaveLength(2)

    await user.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute('type', 'text')

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(
      screen.getByRole('link', { name: 'Voltar à página inicial' }),
    ).toHaveAttribute('href', '/')
  })

  it('valida campos obrigatórios, formato de e-mail, força da senha e confirmação antes de disparar HTTP', async () => {
    const adapterSpy = vi.fn<AxiosAdapter>()
    httpClient.defaults.adapter = adapterSpy
    const { user } = renderRegisterRoutes()

    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(
      await screen.findByText('Nome completo é obrigatório.'),
    ).toBeInTheDocument()
    expect(screen.getByText('E-mail é obrigatório.')).toBeInTheDocument()
    expect(screen.getByText('Senha é obrigatória.')).toBeInTheDocument()
    expect(
      screen.getByText('Confirmação de senha é obrigatória.'),
    ).toBeInTheDocument()
    expect(adapterSpy).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/Nome completo/i), 'Ana Clara')
    await user.type(screen.getByLabelText(/E-mail/i), 'invalido')
    await user.type(screen.getByLabelText(/^Senha/i), 'fraca')
    await user.type(screen.getByLabelText(/Confirmar senha/i), 'diferente')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(
      await screen.findByText('Informe um e-mail válido.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('A senha deve ter entre 8 e 72 caracteres.'),
    ).toBeInTheDocument()
    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument()
    expect(screen.getByLabelText(/E-mail/i)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(adapterSpy).not.toHaveBeenCalled()
  }, 15_000)

  it('integra cadastro via pipeline Axios POST /auth/register, exibe Toast e redireciona para /login', async () => {
    const mockUser: AuthUserResponse = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      nome: 'Ana Clara Silva',
      email: 'ana@ufpb.br',
      status: 'ATIVO',
      createdAt: '2026-11-25T11:50:00Z',
      updatedAt: '2026-11-25T11:50:00Z',
    }

    const adapterSpy = vi.fn<AxiosAdapter>(async (config) =>
      createJsonResponse(config, 201, mockUser),
    )
    httpClient.defaults.adapter = adapterSpy

    const { user } = renderRegisterRoutes()

    await user.type(screen.getByLabelText(/Nome completo/i), 'Ana Clara Silva')
    await user.type(screen.getByLabelText(/E-mail/i), 'Ana@UFPB.br')
    await user.type(screen.getByLabelText(/^Senha/i), 'UniFlow@2026')
    await user.type(screen.getByLabelText(/Confirmar senha/i), 'UniFlow@2026')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(adapterSpy).toHaveBeenCalledTimes(1)
    })

    const sentConfig = adapterSpy.mock.calls[0]?.[0]
    expect(sentConfig?.method).toBe('post')
    expect(sentConfig?.url).toBe('/auth/register')
    expect(JSON.parse(String(sentConfig?.data))).toEqual({
      nome: 'Ana Clara Silva',
      email: 'ana@ufpb.br',
      senha: 'UniFlow@2026',
    })

    expect(
      await screen.findByText('Conta criada com sucesso!'),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Entrar no UniFlow',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/E-mail/i)).toHaveValue('ana@ufpb.br')
  }, 15_000)

  it('normaliza 409 e 400 RFC 7807 reais da API, limpa alerta anterior ao reenviar e mapeia fieldErrors', async () => {
    const adapterSpy = vi
      .fn<AxiosAdapter>()
      .mockImplementationOnce(async (config) => {
        throw createProblemError(config, 409, {
          status: 409,
          detail: 'Ja existe um usuario cadastrado com este e-mail.',
          code: 'RESOURCE_CONFLICT',
        })
      })
      .mockImplementationOnce(async (config) => {
        throw createProblemError(config, 400, {
          status: 400,
          detail: 'Um ou mais campos estão inválidos.',
          code: 'VALIDATION_ERROR',
          fieldErrors: [
            { field: 'email', message: 'e-mail ja cadastrado no sistema' },
          ],
        })
      })
    httpClient.defaults.adapter = adapterSpy

    const { user } = renderRegisterRoutes()

    await user.type(screen.getByLabelText(/Nome completo/i), 'Ana Clara Silva')
    await user.type(screen.getByLabelText(/E-mail/i), 'ana@ufpb.br')
    await user.type(screen.getByLabelText(/^Senha/i), 'UniFlow@2026')
    await user.type(screen.getByLabelText(/Confirmar senha/i), 'UniFlow@2026')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ja existe um usuario cadastrado com este e-mail.',
    )
    expect(adapterSpy).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(
      await screen.findByText('e-mail ja cadastrado no sistema'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Ja existe um usuario cadastrado com este e-mail.'),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText(/E-mail/i)).toHaveAttribute(
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

    const { user } = renderRegisterRoutes()

    await user.type(screen.getByLabelText(/Nome completo/i), 'Ana Clara Silva')
    await user.type(screen.getByLabelText(/E-mail/i), 'ana@ufpb.br')
    await user.type(screen.getByLabelText(/^Senha/i), 'UniFlow@2026')
    await user.type(screen.getByLabelText(/Confirmar senha/i), 'UniFlow@2026')

    const submitButton = screen.getByRole('button', { name: 'Criar conta' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(adapterSpy).toHaveBeenCalledTimes(1)
    })

    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText(/Nome completo/i)).toBeDisabled()
    expect(screen.getByLabelText(/E-mail/i)).toBeDisabled()
    expect(screen.getByLabelText(/^Senha/i)).toBeDisabled()
    expect(screen.getByLabelText(/Confirmar senha/i)).toBeDisabled()

    await user.click(submitButton)
    expect(adapterSpy).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveRequest?.(
        createJsonResponse(pendingConfig as InternalAxiosRequestConfig, 201, {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nome: 'Ana Clara Silva',
          email: 'ana@ufpb.br',
          status: 'ATIVO',
          createdAt: '2026-11-25T11:50:00Z',
          updatedAt: '2026-11-25T11:50:00Z',
        } satisfies AuthUserResponse),
      )
    })

    expect(
      await screen.findByRole(
        'heading',
        {
          level: 1,
          name: 'Entrar no UniFlow',
        },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument()
  }, 15_000)
})
