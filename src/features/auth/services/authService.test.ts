import { AxiosError, AxiosHeaders, type AxiosAdapter } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  loginUser,
  refreshAuthTokens,
  registerUser,
  toLoginRequest,
  toRefreshTokenRequest,
  toRegisterRequest,
} from '@/features/auth/services/authService.ts'
import { authSession } from '@/features/auth/session/authSession.ts'
import type {
  AuthTokenResponse,
  AuthUserResponse,
} from '@/features/auth/types/authTypes.ts'
import { httpClient, isHttpClientError } from '@/services/httpClient.ts'

describe('authService', () => {
  const originalAdapter = httpClient.defaults.adapter

  afterEach(() => {
    httpClient.defaults.adapter = originalAdapter
  })

  it('toRegisterRequest mapeia valores do formulário para o contrato em português sem confirmPassword', () => {
    expect(
      toRegisterRequest({
        name: '  Ana Clara Silva  ',
        email: '  ANA.Silva@UNIFLOW.EDU ',
        password: 'UniFlow@2026',
      }),
    ).toEqual({
      nome: 'Ana Clara Silva',
      email: 'ana.silva@uniflow.edu',
      senha: 'UniFlow@2026',
    })
  })

  it('registerUser envia POST /auth/register pelo pipeline completo do httpClient e retorna AuthUserResponse', async () => {
    const mockResponse: AuthUserResponse = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      nome: 'Ana Clara Silva',
      email: 'ana.silva@uniflow.edu',
      status: 'ATIVO',
      createdAt: '2026-11-25T11:50:00Z',
      updatedAt: '2026-11-25T11:50:00Z',
    }

    const adapterSpy = vi.fn<AxiosAdapter>(async (config) => ({
      data: JSON.stringify(mockResponse),
      status: 201,
      statusText: 'Created',
      headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
      config,
    }))
    httpClient.defaults.adapter = adapterSpy

    const result = await registerUser({
      nome: 'Ana Clara Silva',
      email: 'ana.silva@uniflow.edu',
      senha: 'UniFlow@2026',
    })

    expect(adapterSpy).toHaveBeenCalledTimes(1)
    const sentConfig = adapterSpy.mock.calls[0]?.[0]
    expect(sentConfig?.method).toBe('post')
    expect(sentConfig?.url).toBe('/auth/register')
    expect(sentConfig?.baseURL).toMatch(/\/api\/v1$/)
    expect(JSON.parse(String(sentConfig?.data))).toEqual({
      nome: 'Ana Clara Silva',
      email: 'ana.silva@uniflow.edu',
      senha: 'UniFlow@2026',
    })
    expect(result).toEqual(mockResponse)
  })

  it('toLoginRequest normaliza credenciais e loginUser envia POST /auth/login pelo httpClient', async () => {
    expect(
      toLoginRequest({
        email: '  Ana.Silva@UNIFLOW.EDU ',
        password: 'UniFlow@2026',
      }),
    ).toEqual({
      email: 'ana.silva@uniflow.edu',
      senha: 'UniFlow@2026',
    })

    const mockTokenResponse: AuthTokenResponse = {
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

    const adapterSpy = vi.fn<AxiosAdapter>(async (config) => ({
      data: JSON.stringify(mockTokenResponse),
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
      config,
    }))
    httpClient.defaults.adapter = adapterSpy

    const result = await loginUser({
      email: 'ana.silva@uniflow.edu',
      senha: 'UniFlow@2026',
    })

    expect(adapterSpy).toHaveBeenCalledTimes(1)
    const sentConfig = adapterSpy.mock.calls[0]?.[0]
    expect(sentConfig?.method).toBe('post')
    expect(sentConfig?.url).toBe('/auth/login')
    expect(JSON.parse(String(sentConfig?.data))).toEqual({
      email: 'ana.silva@uniflow.edu',
      senha: 'UniFlow@2026',
    })
    expect(result).toEqual(mockTokenResponse)
  })

  it('propaga HttpClientError normalizado quando a API responde erro RFC 7807', async () => {
    httpClient.defaults.adapter = async (config) => {
      throw new AxiosError(
        'Request failed with status code 401',
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        {
          data: JSON.stringify({
            status: 401,
            detail: 'Credenciais inválidas.',
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

    let caughtError: unknown
    try {
      await loginUser({
        email: 'ana.silva@uniflow.edu',
        senha: 'wrong',
      })
    } catch (error) {
      caughtError = error
    }

    expect(isHttpClientError(caughtError)).toBe(true)
    if (isHttpClientError(caughtError)) {
      expect(caughtError.status).toBe(401)
      expect(caughtError.code).toBe('AUTHENTICATION_FAILED')
      expect(caughtError.message).toBe('Credenciais inválidas.')
    }
  })

  it('refreshAuthTokens envia POST /auth/refresh sem Authorization Bearer e valida refreshToken não vazio', async () => {
    expect(() => toRefreshTokenRequest('   ')).toThrow(
      /Refresh token é obrigatório/,
    )

    const rotatedResponse: AuthTokenResponse = {
      accessToken: 'jwt-rotated-2',
      refreshToken: 'rft-rotated-2',
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

    authSession.setSession({
      ...rotatedResponse,
      accessToken: 'jwt-expired-1',
      refreshToken: 'rft-initial-1',
    })

    const adapterSpy = vi.fn<AxiosAdapter>(async (config) => ({
      data: JSON.stringify(rotatedResponse),
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
      config,
    }))
    httpClient.defaults.adapter = adapterSpy

    const result = await refreshAuthTokens({
      refreshToken: '  rft-initial-1  ',
    })

    expect(adapterSpy).toHaveBeenCalledTimes(1)
    const sentConfig = adapterSpy.mock.calls[0]?.[0]
    expect(sentConfig?.method).toBe('post')
    expect(sentConfig?.url).toBe('/auth/refresh')
    expect(sentConfig?.headers.has('Authorization')).toBe(false)
    expect(JSON.parse(String(sentConfig?.data))).toEqual({
      refreshToken: 'rft-initial-1',
    })
    expect(result).toEqual(rotatedResponse)
  })
})
