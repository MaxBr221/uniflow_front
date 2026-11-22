import { describe, expect, it } from 'vitest'
import { SPACING_CLASSES, SPACING_TOKENS } from '@/styles/spacing.ts'

describe('SPACING_TOKENS', () => {
  it('segue grade base de 4px consistente entre valores em px e rem', () => {
    expect(SPACING_TOKENS.baseUnitPx).toBe(4)
    expect(SPACING_TOKENS.baseUnitRem).toBe('0.25rem')

    for (const [step, token] of Object.entries(SPACING_TOKENS.scale)) {
      const numericStep = Number(step)
      expect(token.px).toBe(numericStep * SPACING_TOKENS.baseUnitPx)
      expect(token.rem).toBe(`${token.px / 16}rem`)
    }
  })

  it('define tokens semânticos válidos para inset, stack e dimensões de layout', () => {
    const allSemanticValues = [
      ...Object.values(SPACING_TOKENS.semantic.inset),
      ...Object.values(SPACING_TOKENS.semantic.stack),
      ...Object.values(SPACING_TOKENS.semantic.layout),
    ]

    for (const value of allSemanticValues) {
      expect(value).toMatch(/^\d+(\.\d+)?rem$/)
    }
  })

  it('expõe presets responsivos não vazios para ritmo de páginas e componentes', () => {
    expect(Object.keys(SPACING_CLASSES)).toEqual([
      'pageContainer',
      'centeredShell',
      'cardPadding',
      'cardPaddingCompact',
      'sectionStack',
      'formStack',
      'fieldStack',
      'inlineGroup',
      'cardGrid',
    ])

    for (const className of Object.values(SPACING_CLASSES)) {
      expect(className.trim().length).toBeGreaterThan(0)
    }
  })
})
