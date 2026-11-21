import { describe, expect, it } from 'vitest'
import { BRAND_IDENTITY } from '@/lib/brand.ts'
import { COLOR_PALETTE } from '@/styles/colors.ts'

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

function collectHexValues(node: unknown): string[] {
  if (typeof node === 'string') {
    return [node]
  }
  if (typeof node === 'object' && node !== null) {
    return Object.values(node).flatMap((value) => collectHexValues(value))
  }
  return []
}

describe('COLOR_PALETTE', () => {
  it('define exclusivamente códigos hexadecimais válidos em toda a paleta', () => {
    const hexValues = collectHexValues(COLOR_PALETTE)
    expect(hexValues.length).toBeGreaterThan(0)

    for (const value of hexValues) {
      expect(value).toMatch(HEX_COLOR_PATTERN)
    }
  })

  it('mantém alinhamento com a cor focal da identidade visual e tokens semânticos', () => {
    expect(COLOR_PALETTE.brand[600]).toBe(BRAND_IDENTITY.themeColor)
    expect(COLOR_PALETTE.border.focus).toBe(COLOR_PALETTE.brand[600])
    expect(COLOR_PALETTE.surface.canvas).toBe('#f8f7fc')
    expect(COLOR_PALETTE.surface.card).toBe('#ffffff')
  })
})
