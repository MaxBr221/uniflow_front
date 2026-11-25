import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Loading, Skeleton } from '@/components/Loading.tsx'

describe('Loading', () => {
  it('renderiza variante block padrão com role="status", aria-busy e textos opcionais', () => {
    render(
      <Loading description="Buscando suas disciplinas do semestre." />,
    )

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveTextContent('Carregando...')
    expect(
      screen.getByText('Buscando suas disciplinas do semestre.'),
    ).toBeInTheDocument()

    const svg = status.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg?.getAttribute('class')).toContain('text-brand-600')
  })

  it('suporta variante inline com sr-only fallback, rótulo visível, tamanhos e tons', () => {
    const { rerender } = render(<Loading variant="inline" size="sm" />)

    const compactInline = screen.getByRole('status')
    expect(compactInline.className).toContain('inline-flex')
    expect(screen.getByText('Carregando...')).toHaveClass('sr-only')

    rerender(
      <Loading
        variant="inline"
        size="lg"
        tone="inverse"
        label="Salvando alterações..."
      />,
    )

    const labeledInline = screen.getByRole('status')
    expect(labeledInline).toHaveTextContent('Salvando alterações...')
    expect(
      labeledInline.querySelector('svg')?.getAttribute('class'),
    ).toContain('text-ink-inverse')

    rerender(
      <Loading
        variant="inline"
        tone="neutral"
        label=""
        ariaLabel="Sincronizando dados"
      />,
    )

    expect(screen.getByText('Sincronizando dados')).toHaveClass('sr-only')
  })

  it('renderiza variantes fullscreen (com showBrand) e overlay corretamente', () => {
    const { rerender } = render(<Loading variant="fullscreen" showBrand />)

    const fullscreen = screen.getByRole('status')
    expect(fullscreen.className).toContain('min-h-svh')
    expect(fullscreen.className).toContain('bg-surface-canvas')
    expect(screen.getByText('UniFlow')).toBeInTheDocument()

    rerender(<Loading variant="overlay" label="Atualizando painel..." />)

    const overlay = screen.getByRole('status')
    expect(overlay.className).toContain('absolute')
    expect(overlay.className).toContain('inset-0')
    expect(overlay).toHaveTextContent('Atualizando painel...')
  })

  it('renderiza Skeleton com formas text, multi-linhas, rect, circle e label acessível opcional', () => {
    const { rerender } = render(<Skeleton data-testid="skeleton-single" />)

    const single = screen.getByTestId('skeleton-single')
    expect(single).toHaveAttribute('aria-hidden', 'true')
    expect(single.className).toContain('bg-surface-muted')
    expect(single.className).toContain('animate-pulse')

    rerender(
      <Skeleton
        lines={3}
        label="Carregando resumo de atividades"
        data-testid="skeleton-lines"
      />,
    )

    const multi = screen.getByRole('status')
    const bars = multi.querySelectorAll('span[aria-hidden="true"]')
    expect(bars).toHaveLength(3)
    expect(bars[2].className).toContain('w-3/4')
    expect(
      screen.getByText('Carregando resumo de atividades'),
    ).toHaveClass('sr-only')

    rerender(<Skeleton shape="rect" data-testid="skeleton-rect" />)
    expect(screen.getByTestId('skeleton-rect').className).toContain('rounded-xl')

    rerender(<Skeleton shape="circle" data-testid="skeleton-circle" />)
    expect(screen.getByTestId('skeleton-circle').className).toContain(
      'rounded-full',
    )
  })
})
