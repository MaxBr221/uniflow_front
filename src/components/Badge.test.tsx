import { render, screen } from '@testing-library/react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { Badge } from '@/components/Badge.tsx'

describe('Badge', () => {
  it('aplica estilo padrão neutral soft e renderiza variantes de aparência e tom', () => {
    const { rerender } = render(<Badge>Pendente</Badge>)

    const neutralBadge = screen.getByText('Pendente').closest('span')
      ?.parentElement as HTMLElement
    expect(neutralBadge.className).toContain('bg-surface-subtle')
    expect(neutralBadge.className).toContain('text-ink-secondary')
    expect(neutralBadge.className).toContain('px-2.5')

    rerender(
      <Badge tone="success" appearance="outline" size="lg">
        Concluída
      </Badge>,
    )

    const successBadge = screen.getByText('Concluída').closest('span')
      ?.parentElement as HTMLElement
    expect(successBadge.className).toContain('bg-surface-card')
    expect(successBadge.className).toContain('border-success-200')
    expect(successBadge.className).toContain('text-success-700')
    expect(successBadge.className).toContain('px-3')

    rerender(
      <Badge tone="danger" appearance="solid" size="sm">
        Atrasada
      </Badge>,
    )

    const dangerBadge = screen.getByText('Atrasada').closest('span')
      ?.parentElement as HTMLElement
    expect(dangerBadge.className).toContain('bg-danger-600')
    expect(dangerBadge.className).toContain('text-ink-inverse')
    expect(dangerBadge.className).toContain('px-2')
  })

  it('renderiza indicador dot decorativo, ícones acessíveis, modo mono e uppercase', () => {
    const { rerender } = render(
      <Badge tone="brand" dot data-testid="dot-badge">
        Semestre atual
      </Badge>,
    )

    const dotBadge = screen.getByTestId('dot-badge')
    const dotIndicator = dotBadge.querySelector('span[aria-hidden="true"]')
    expect(dotIndicator).toBeInTheDocument()
    expect(dotIndicator?.className).toContain('bg-brand-600')

    rerender(
      <Badge
        tone="warning"
        leftIcon={AlertTriangle}
        rightIcon={CheckCircle2}
        uppercase
        mono
        data-testid="icon-badge"
      >
        COMP-204
      </Badge>,
    )

    const iconBadge = screen.getByTestId('icon-badge')
    const svgs = iconBadge.querySelectorAll('svg')
    expect(svgs).toHaveLength(2)
    expect(svgs[0]).toHaveAttribute('aria-hidden', 'true')
    expect(iconBadge.className).toContain('uppercase')
    expect(iconBadge.className).toContain('font-mono')
  })
})
