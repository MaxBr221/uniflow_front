import { describe, expect, it } from 'vitest'
import {
  DEFAULT_API_TIMEOUT_MS,
  DEFAULT_APP_NAME,
  parseEnv,
} from '@/lib/env.ts'

describe('parseEnv', () => {
  it('aplica os valores padrão quando variáveis opcionais estão ausentes ou vazias', () => {
    const parsed = parseEnv({
      VITE_API_BASE_URL: '',
      VITE_API_TIMEOUT_MS: '',
      VITE_APP_NAME: '   ',
      DEV: true,
      PROD: false,
    })

    expect(parsed).toEqual({
      apiBaseUrl: '',
      apiTimeoutMs: DEFAULT_API_TIMEOUT_MS,
      appName: DEFAULT_APP_NAME,
      isDev: true,
      isProd: false,
    })
  })

  it('normaliza URL válida removendo barras finais', () => {
    const parsed = parseEnv({
      VITE_API_BASE_URL: 'https://api.uniflow.app/v1///',
      VITE_API_TIMEOUT_MS: '20000',
      VITE_APP_NAME: 'UniFlow Acadêmico',
      DEV: false,
      PROD: true,
    })

    expect(parsed.apiBaseUrl).toBe('https://api.uniflow.app/v1')
    expect(parsed.apiTimeoutMs).toBe(20_000)
    expect(parsed.appName).toBe('UniFlow Acadêmico')
  })

  it('rejeita URL inválida e timeout fora da faixa permitida', () => {
    expect(() =>
      parseEnv({
        VITE_API_BASE_URL: 'ftp://api.invalida',
      }),
    ).toThrow(/VITE_API_BASE_URL/)

    expect(() =>
      parseEnv({
        VITE_API_TIMEOUT_MS: '500',
      }),
    ).toThrow(/VITE_API_TIMEOUT_MS/)
  })
})
