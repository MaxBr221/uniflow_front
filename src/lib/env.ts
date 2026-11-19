import { z } from 'zod'

export const DEFAULT_API_TIMEOUT_MS = 15_000
export const DEFAULT_APP_NAME = 'UniFlow'

const apiBaseUrlSchema = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ?? '').replace(/\/+$/, ''))
  .refine(
    (value) => {
      if (value === '' || value.startsWith('/')) {
        return true
      }
      try {
        const parsed = new URL(value)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    },
    {
      error:
        'VITE_API_BASE_URL deve começar com "/" ou ser uma URL http(s) válida.',
    },
  )

const apiTimeoutSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) {
      return DEFAULT_API_TIMEOUT_MS
    }
    const raw = typeof value === 'number' ? String(value) : value.trim()
    if (raw === '') {
      return DEFAULT_API_TIMEOUT_MS
    }
    const parsed = Number(raw)
    if (!Number.isInteger(parsed) || parsed < 1_000 || parsed > 120_000) {
      ctx.addIssue({
        code: 'custom',
        message:
          'VITE_API_TIMEOUT_MS deve ser um número inteiro entre 1000 e 120000.',
      })
      return z.NEVER
    }
    return parsed
  })

const appNameSchema = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_APP_NAME
  })

const rawEnvSchema = z.object({
  VITE_API_BASE_URL: apiBaseUrlSchema,
  VITE_API_TIMEOUT_MS: apiTimeoutSchema,
  VITE_APP_NAME: appNameSchema,
})

export interface AppEnv {
  readonly apiBaseUrl: string
  readonly apiTimeoutMs: number
  readonly appName: string
  readonly isDev: boolean
  readonly isProd: boolean
}

export function parseEnv(
  source: Record<string, unknown> = import.meta.env,
): AppEnv {
  const result = rawEnvSchema.safeParse(source)

  if (!result.success) {
    const details = result.error.issues.map((issue) => issue.message).join(' ')
    throw new Error(
      `Configuração de variáveis de ambiente inválida: ${details}`,
    )
  }

  return {
    apiBaseUrl: result.data.VITE_API_BASE_URL,
    apiTimeoutMs: result.data.VITE_API_TIMEOUT_MS,
    appName: result.data.VITE_APP_NAME,
    isDev: Boolean(source.DEV ?? import.meta.env.DEV),
    isProd: Boolean(source.PROD ?? import.meta.env.PROD),
  }
}

export const env: AppEnv = parseEnv()
