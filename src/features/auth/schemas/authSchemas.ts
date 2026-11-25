import { requiredTextSchema, z } from '@/lib/validation.ts'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: 'E-mail é obrigatório.' })
  .max(255, { error: 'E-mail deve ter no máximo 255 caracteres.' })
  .pipe(z.email({ error: 'Informe um e-mail válido.' }))

export const registerPasswordSchema = z
  .string()
  .min(1, { error: 'Senha é obrigatória.' })
  .min(PASSWORD_MIN_LENGTH, {
    error: `A senha deve ter entre ${PASSWORD_MIN_LENGTH} e ${PASSWORD_MAX_LENGTH} caracteres.`,
  })
  .max(PASSWORD_MAX_LENGTH, {
    error: `A senha deve ter entre ${PASSWORD_MIN_LENGTH} e ${PASSWORD_MAX_LENGTH} caracteres.`,
  })
  .regex(/^\S+$/, {
    error: 'A senha não deve conter espaços.',
  })
  .regex(/[a-z]/, {
    error: 'A senha deve conter pelo menos uma letra minúscula.',
  })
  .regex(/[A-Z]/, {
    error: 'A senha deve conter pelo menos uma letra maiúscula.',
  })
  .regex(/\d/, {
    error: 'A senha deve conter pelo menos um número.',
  })
  .regex(/[^A-Za-z0-9\s]/, {
    error: 'A senha deve conter pelo menos um caractere especial.',
  })

export const registerSchema = z
  .object({
    name: requiredTextSchema('Nome completo')
      .min(2, { error: 'Nome completo deve ter entre 2 e 150 caracteres.' })
      .max(150, { error: 'Nome completo deve ter entre 2 e 150 caracteres.' }),
    email: emailSchema,
    password: registerPasswordSchema,
    confirmPassword: z
      .string()
      .min(1, { error: 'Confirmação de senha é obrigatória.' }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    error: 'As senhas não coincidem.',
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, { error: 'Senha é obrigatória.' })
    .max(PASSWORD_MAX_LENGTH, {
      error: `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`,
    }),
})

export type LoginFormValues = z.infer<typeof loginSchema>
