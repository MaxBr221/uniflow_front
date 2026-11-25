import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from '@/components/Badge.tsx'
import { Button } from '@/components/Button.tsx'
import {
  PageHeader,
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveStack,
} from '@/components/Responsive.tsx'

describe('Componentes responsivos', () => {
  it('renderiza ResponsiveContainer com tamanhos semânticos, padding e modo centralizado', () => {
    const { rerender } = render(
      <ResponsiveContainer as="main" data-testid="container">
        <div>Conteúdo principal</div>
      </ResponsiveContainer>,
    )

    const mainContainer = screen.getByTestId('container')
    expect(mainContainer.tagName).toBe('MAIN')
    expect(mainContainer.className).toContain('max-w-content')
    expect(mainContainer.className).toContain('px-inset-md')
    expect(mainContainer.className).toContain('lg:px-inset-xl')

    rerender(
      <ResponsiveContainer
        size="narrow"
        padding="compact"
        centered
        data-testid="container"
      >
        <div>Tela de login</div>
      </ResponsiveContainer>,
    )

    const authContainer = screen.getByTestId('container')
    expect(authContainer.className).toContain('max-w-md')
    expect(authContainer.className).toContain('px-inset-sm')
    expect(authContainer.className).toContain('min-h-svh')
  })

  it('renderiza PageHeader com empilhamento mobile, divisor e bloco de ações', () => {
    render(
      <PageHeader
        eyebrow={<Badge tone="brand">2026.2</Badge>}
        title="Disciplinas"
        description="Gerencie matérias, cargas horárias e horários do semestre."
        actions={<Button>Nova disciplina</Button>}
        divided
      />,
    )

    const header = screen.getByRole('banner')
    expect(header.className).toContain('flex-col')
    expect(header.className).toContain('sm:flex-row')
    expect(header.className).toContain('border-b')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Disciplinas' }),
    ).toBeInTheDocument()
    expect(screen.getByText('2026.2')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Nova disciplina' }),
    ).toBeInTheDocument()
  })

  it('renderiza ResponsiveGrid e ResponsiveStack com breakpoints configuráveis', () => {
    const { rerender } = render(
      <ResponsiveGrid columns={4} gap="lg" as="ul" data-testid="grid">
        <li>Card 1</li>
        <li>Card 2</li>
      </ResponsiveGrid>,
    )

    const grid = screen.getByTestId('grid')
    expect(grid.tagName).toBe('UL')
    expect(grid.className).toContain('grid-cols-1')
    expect(grid.className).toContain('sm:grid-cols-2')
    expect(grid.className).toContain('lg:grid-cols-3')
    expect(grid.className).toContain('xl:grid-cols-4')
    expect(grid.className).toContain('gap-stack-lg')

    rerender(
      <ResponsiveStack
        breakpoint="lg"
        align="center"
        justify="between"
        wrap
        data-testid="stack"
      >
        <span>Filtro</span>
        <span>Ação</span>
      </ResponsiveStack>,
    )

    const stack = screen.getByTestId('stack')
    expect(stack.className).toContain('flex-col')
    expect(stack.className).toContain('lg:flex-row')
    expect(stack.className).toContain('lg:items-center')
    expect(stack.className).toContain('justify-between')
    expect(stack.className).toContain('flex-wrap')
  })
})
