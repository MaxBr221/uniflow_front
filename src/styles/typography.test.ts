import { describe, expect, it } from 'vitest'
import { TYPOGRAPHY_CLASSES, TYPOGRAPHY_TOKENS } from '@/styles/typography.ts'

describe('TYPOGRAPHY_TOKENS', () => {
  it('define famílias tipográficas legíveis com fallback de sistema', () => {
    expect(TYPOGRAPHY_TOKENS.families.sans).toContain('Inter Variable')
    expect(TYPOGRAPHY_TOKENS.families.display).toContain(
      'Plus Jakarta Sans Variable',
    )
    expect(TYPOGRAPHY_TOKENS.families.mono).toContain('monospace')
  })

  it('define escala com tamanhos em rem e alturas de linha confortáveis', () => {
    for (const token of Object.values(TYPOGRAPHY_TOKENS.scale)) {
      expect(token.size).toMatch(/^\d+(\.\d+)?rem$/)
      expect(token.lineHeight).toBeGreaterThanOrEqual(1.2)
      expect(token.lineHeight).toBeLessThanOrEqual(1.7)
    }
  })

  it('expõe classes utilitárias semânticas para todos os papéis tipográficos', () => {
    expect(Object.keys(TYPOGRAPHY_CLASSES)).toEqual([
      'display',
      'headingLg',
      'headingMd',
      'headingSm',
      'body',
      'bodySm',
      'caption',
      'label',
      'metric',
    ])

    for (const className of Object.values(TYPOGRAPHY_CLASSES)) {
      expect(className.trim().length).toBeGreaterThan(0)
    }
  })
})
