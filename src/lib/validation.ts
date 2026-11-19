import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ptBR from 'zod/v4/locales/pt-BR.js'

let isZodConfigured = false

/**
 * Applies UniFlow's default Portuguese (Brazil) locale error messages to Zod once.
 */
export function configureZod(): void {
  if (isZodConfigured) {
    return
  }

  z.config(ptBR())
  isZodConfigured = true
}

export function requiredTextSchema(fieldLabel = 'Campo') {
  return z
    .string()
    .trim()
    .min(1, { error: `${fieldLabel} é obrigatório.` })
}

export { z, zodResolver }
