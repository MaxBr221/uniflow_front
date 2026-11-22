import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/Button.tsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/Card.tsx'

describe('Card', () => {
  it('aplica tokens visuais padrão, tons semânticos, padding, elevação e estado interactive', () => {
    const { rerender } = render(<Card data-testid="card">Conteúdo base</Card>)

    const defaultCard = screen.getByTestId('card')
    expect(defaultCard.tagName).toBe('DIV')
    expect(defaultCard.className).toContain('bg-surface-card')
    expect(defaultCard.className).toContain('border-border-subtle')
    expect(defaultCard.className).toContain('p-inset-lg')
    expect(defaultCard.className).toContain('shadow-xs')

    rerender(
      <Card
        data-testid="card"
        as="article"
        tone="danger"
        padding="compact"
        elevation="md"
        interactive
      >
        Atividades atrasadas
      </Card>,
    )

    const dangerCard = screen.getByTestId('card')
    expect(dangerCard.tagName).toBe('ARTICLE')
    expect(dangerCard.className).toContain('bg-danger-50/70')
    expect(dangerCard.className).toContain('border-danger-200')
    expect(dangerCard.className).toContain('p-inset-md')
    expect(dangerCard.className).toContain('shadow-sm')
    expect(dangerCard.className).toContain('hover:border-danger-600/40')
  })

  it('renderiza props declarativas (title, description, headerAction, footer e divided) com acessibilidade', () => {
    render(
      <Card
        as="section"
        title="Próximas atividades"
        titleAs="h2"
        description="Entregas previstas para esta semana."
        headerAction={<Button size="sm">Ver todas</Button>}
        footer={<span>Total: 3 pendentes</span>}
        divided
      >
        <p>Lista de tarefas acadêmicas</p>
      </Card>,
    )

    const section = screen.getByRole('region', { name: 'Próximas atividades' })
    expect(section).toBeInTheDocument()

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Próximas atividades',
    })
    expect(heading.className).toContain('font-display')
    expect(
      screen.getByText('Entregas previstas para esta semana.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Ver todas' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Lista de tarefas acadêmicas')).toBeInTheDocument()
    expect(screen.getByText('Total: 3 pendentes')).toBeInTheDocument()
    expect(heading.closest('div')?.parentElement?.className).toContain(
      'border-b',
    )
    expect(
      screen.getByText('Total: 3 pendentes').closest('div')?.className,
    ).toContain('border-t')
  })

  it('suporta composição explícita com CardHeader, CardTitle, CardDescription, CardContent e CardFooter', () => {
    render(
      <Card padding="none" elevation="none" tone="brand" data-testid="composed">
        <CardHeader bordered action={<span>2026.2</span>}>
          <CardTitle>Estrutura de Dados</CardTitle>
          <CardDescription>COMP-204 • 60h</CardDescription>
        </CardHeader>
        <CardContent data-testid="card-body">
          <p>Conteúdo principal da disciplina</p>
        </CardContent>
        <CardFooter bordered data-testid="card-footer">
          <Button variant="outline" size="sm">
            Detalhes
          </Button>
        </CardFooter>
      </Card>,
    )

    const card = screen.getByTestId('composed')
    expect(card.className).toContain('bg-brand-50/70')
    expect(card.className).toContain('shadow-none')
    expect(card.className).not.toContain('p-inset-lg')

    expect(
      screen.getByRole('heading', { level: 3, name: 'Estrutura de Dados' }),
    ).toBeInTheDocument()
    expect(screen.getByText('2026.2')).toBeInTheDocument()
    expect(screen.getByTestId('card-body').className).toContain('flex-1')
    expect(screen.getByTestId('card-footer').className).toContain('border-t')
  })
})
