import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookOpen, Plus, RotateCcw } from 'lucide-react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/Button.tsx'
import { EmptyState } from '@/components/EmptyState.tsx'

describe('EmptyState', () => {
  it('renderiza estado vazio padrão (card, tone brand, size md) com ícone decorativo e textos', () => {
    render(
      <EmptyState
        data-testid="empty-default"
        title="Nenhuma atividade pendente"
        description="Você está em dia com suas entregas acadêmicas."
      />,
    )

    const container = screen.getByTestId('empty-default')
    expect(container.className).toContain('bg-surface-card')
    expect(container.className).toContain('border-dashed')
    expect(container.className).toContain('rounded-2xl')

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Nenhuma atividade pendente',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Você está em dia com suas entregas acadêmicas.'),
    ).toBeInTheDocument()

    const iconWrapper = container.querySelector('span[aria-hidden="true"]')
    expect(iconWrapper?.className).toContain('bg-brand-50')
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('suporta variante plain, tone neutral, size sm/lg, section acessível e ocultação de ícone', () => {
    const { rerender } = render(
      <EmptyState
        as="section"
        variant="plain"
        tone="neutral"
        size="sm"
        headingAs="h2"
        icon={BookOpen}
        title="Sem disciplinas neste filtro"
        data-testid="empty-plain"
      />,
    )

    const region = screen.getByRole('region', {
      name: 'Sem disciplinas neste filtro',
    })
    expect(region.className).toContain('bg-transparent')
    expect(region.className).not.toContain('border-dashed')

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Sem disciplinas neste filtro',
    })
    expect(heading).toBeInTheDocument()
    expect(
      region.querySelector('span[aria-hidden="true"]')?.className,
    ).toContain('bg-surface-subtle')

    rerender(
      <EmptyState
        size="lg"
        icon={null}
        title="Sem dados no momento"
        data-testid="empty-no-icon"
      />,
    )

    const noIcon = screen.getByTestId('empty-no-icon')
    expect(noIcon.querySelector('svg')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Sem dados no momento' }).className,
    ).toContain('text-heading-md')
  })

  it('executa ação primária e secundária (botão e link) ou ações customizadas', async () => {
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    const onSecondary = vi.fn()

    const { rerender } = render(
      <EmptyState
        title="Nenhuma disciplina cadastrada"
        description="Comece criando sua primeira disciplina."
        action={{ label: 'Nova disciplina', icon: Plus, onClick: onPrimary }}
        secondaryAction={{
          label: 'Limpar filtros',
          icon: RotateCcw,
          onClick: onSecondary,
        }}
      />,
    )

    const primaryBtn = screen.getByRole('button', { name: 'Nova disciplina' })
    const secondaryBtn = screen.getByRole('button', { name: 'Limpar filtros' })
    expect(primaryBtn.className).toContain('bg-brand-600')
    expect(secondaryBtn.className).toContain('border-border-default')

    await user.click(primaryBtn)
    await user.click(secondaryBtn)
    expect(onPrimary).toHaveBeenCalledTimes(1)
    expect(onSecondary).toHaveBeenCalledTimes(1)

    rerender(
      <MemoryRouter>
        <EmptyState
          title="Nenhum semestre configurado"
          action={{ label: 'Ir para semestres', to: '/semestres' }}
          actions={<Button variant="secondary">Ajuda rápida</Button>}
        >
          <p>Dica: configure seu semestre letivo primeiro.</p>
        </EmptyState>
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Dica: configure seu semestre letivo primeiro.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Ajuda rápida' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Ir para semestres' }),
    ).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <EmptyState
          title="Nenhum semestre configurado"
          action={{ label: 'Ir para semestres', to: '/semestres' }}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'Ir para semestres' }),
    ).toHaveAttribute('href', '/semestres')
  })
})
