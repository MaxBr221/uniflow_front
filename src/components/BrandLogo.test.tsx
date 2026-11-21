import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrandLogo, BrandLogoMark } from '@/components/BrandLogo.tsx'
import { BRAND_IDENTITY } from '@/lib/brand.ts'

describe('BrandLogo', () => {
  it('renderiza marca completa com nome UniFlow e tagline opcional', () => {
    render(<BrandLogo showTagline />)

    expect(screen.getByText(BRAND_IDENTITY.name)).toBeInTheDocument()
    expect(screen.getByText(BRAND_IDENTITY.tagline)).toBeInTheDocument()
  })

  it('renderiza apenas o símbolo com texto alternativo acessível na variante mark', () => {
    render(<BrandLogo variant="mark" label="Logotipo UniFlow" />)

    const icon = screen.getByRole('img', { name: 'Logotipo UniFlow' })
    expect(icon).toBeInTheDocument()
    expect(screen.queryByText(BRAND_IDENTITY.name)).not.toBeInTheDocument()
  })

  it('gera ids únicos para gradientes quando múltiplos símbolos são renderizados', () => {
    const { container } = render(
      <>
        <BrandLogoMark size="sm" decorative />
        <BrandLogoMark size="lg" decorative />
      </>,
    )

    const gradients = container.querySelectorAll('linearGradient')
    expect(gradients).toHaveLength(2)
    expect(gradients[0]?.getAttribute('id')).not.toBe(
      gradients[1]?.getAttribute('id'),
    )
  })
})
