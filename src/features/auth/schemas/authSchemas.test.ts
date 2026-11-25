import { describe, expect, it } from 'vitest'
import {
  loginSchema,
  registerSchema,
} from '@/features/auth/schemas/authSchemas.ts'

describe('registerSchema', () => {
  it('aceita dados válidos compatíveis com RegisterRequest e normaliza nome e e-mail', () => {
    const result = registerSchema.safeParse({
      name: '  Ana Clara Silva  ',
      email: '  Ana.Silva@UFPB.BR ',
      password: 'UniFlow@2026',
      confirmPassword: 'UniFlow@2026',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        name: 'Ana Clara Silva',
        email: 'ana.silva@ufpb.br',
        password: 'UniFlow@2026',
        confirmPassword: 'UniFlow@2026',
      })
    }
  })

  it('rejeita nome curto, e-mail inválido, senha fora da política e confirmação divergente', () => {
    const result = registerSchema.safeParse({
      name: 'A',
      email: 'email-invalido',
      password: 'abcdefg',
      confirmPassword: 'outra',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors
      expect(flattened.name).toContain(
        'Nome completo deve ter entre 2 e 150 caracteres.',
      )
      expect(flattened.email).toContain('Informe um e-mail válido.')
      expect(flattened.password).toContain(
        'A senha deve ter entre 8 e 72 caracteres.',
      )
      expect(flattened.password).toContain(
        'A senha deve conter pelo menos uma letra maiúscula.',
      )
      expect(flattened.password).toContain(
        'A senha deve conter pelo menos um número.',
      )
      expect(flattened.password).toContain(
        'A senha deve conter pelo menos um caractere especial.',
      )
      expect(flattened.confirmPassword).toContain('As senhas não coincidem.')
    }
  })

  it('rejeita senha sem minúscula ou com espaços', () => {
    const withSpaces = registerSchema.safeParse({
      name: 'Carlos Eduardo',
      email: 'carlos@uni.edu.br',
      password: 'UniFlow @2026',
      confirmPassword: 'UniFlow @2026',
    })

    expect(withSpaces.success).toBe(false)
    if (!withSpaces.success) {
      expect(withSpaces.error.flatten().fieldErrors.password).toContain(
        'A senha não deve conter espaços.',
      )
    }

    const noLowercase = registerSchema.safeParse({
      name: 'Carlos Eduardo',
      email: 'carlos@uni.edu.br',
      password: 'UNIFLOW@2026',
      confirmPassword: 'UNIFLOW@2026',
    })

    expect(noLowercase.success).toBe(false)
    if (!noLowercase.success) {
      expect(noLowercase.error.flatten().fieldErrors.password).toContain(
        'A senha deve conter pelo menos uma letra minúscula.',
      )
    }
  })

  it('aplica limites exatos de comprimento para nome (2..150 após trim) e senha (8..72)', () => {
    const trimmedShortName = registerSchema.safeParse({
      name: '  A  ',
      email: 'ana@ufpb.br',
      password: 'Abc@1234',
      confirmPassword: 'Abc@1234',
    })
    expect(trimmedShortName.success).toBe(false)

    const validMinBoundaries = registerSchema.safeParse({
      name: 'Ab',
      email: 'ana@ufpb.br',
      password: 'Abc@1234',
      confirmPassword: 'Abc@1234',
    })
    expect(validMinBoundaries.success).toBe(true)

    const maxPassword = 'Abc@1234' + 'x'.repeat(64)
    expect(maxPassword).toHaveLength(72)
    const validMaxBoundaries = registerSchema.safeParse({
      name: 'N'.repeat(150),
      email: 'ana@ufpb.br',
      password: maxPassword,
      confirmPassword: maxPassword,
    })
    expect(validMaxBoundaries.success).toBe(true)

    const overMaxBoundaries = registerSchema.safeParse({
      name: 'N'.repeat(151),
      email: 'ana@ufpb.br',
      password: `${maxPassword}x`,
      confirmPassword: `${maxPassword}x`,
    })
    expect(overMaxBoundaries.success).toBe(false)
    if (!overMaxBoundaries.success) {
      const flattened = overMaxBoundaries.error.flatten().fieldErrors
      expect(flattened.name).toContain(
        'Nome completo deve ter entre 2 e 150 caracteres.',
      )
      expect(flattened.password).toContain(
        'A senha deve ter entre 8 e 72 caracteres.',
      )
    }
  })
})

describe('loginSchema', () => {
  it('aceita credenciais válidas e normaliza o e-mail', () => {
    const result = loginSchema.safeParse({
      email: '  Ana.Silva@UFPB.BR ',
      password: 'secret',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        email: 'ana.silva@ufpb.br',
        password: 'secret',
      })
    }
  })

  it('rejeita e-mail inválido e senha vazia', () => {
    const result = loginSchema.safeParse({
      email: 'invalido',
      password: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors
      expect(flattened.email).toContain('Informe um e-mail válido.')
      expect(flattened.password).toContain('Senha é obrigatória.')
    }
  })
})
