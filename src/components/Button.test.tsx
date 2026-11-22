import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArrowRight, Plus } from 'lucide-react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Button, ButtonLink } from '@/components/Button.tsx'

describe('Button', () => {
  it('usa type="button" por padrão e permite sobrescrever para submit', () => {
    const { rerender } = render(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute(
      'type',
      'button',
    )

    rerender(<Button type="submit">Enviar</Button>)
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute(
      'type',
      'submit',
    )
  })

  it('executa onClick quando habilitado e respeita estado disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    const { rerender } = render(<Button onClick={handleClick}>Criar</Button>)
    await user.click(screen.getByRole('button', { name: 'Criar' }))
    expect(handleClick).toHaveBeenCalledTimes(1)

    rerender(
      <Button onClick={handleClick} disabled>
        Criar
      </Button>,
    )
    const disabledButton = screen.getByRole('button', { name: 'Criar' })
    expect(disabledButton).toBeDisabled()
    await user.click(disabledButton)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('exibe estado de carregamento acessível com texto opcional e bloqueia cliques', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button
        onClick={handleClick}
        isLoading
        loadingText="Salvando..."
        leftIcon={Plus}
      >
        Salvar
      </Button>,
    )

    const loadingButton = screen.getByRole('button', { name: 'Salvando...' })
    expect(loadingButton).toBeDisabled()
    expect(loadingButton).toHaveAttribute('aria-busy', 'true')

    await user.click(loadingButton)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('aplica classes de variante, tamanho e largura total corretamente', () => {
    const { rerender } = render(
      <Button variant="danger" size="lg" fullWidth rightIcon={ArrowRight}>
        Excluir conta
      </Button>,
    )

    const dangerBtn = screen.getByRole('button', { name: 'Excluir conta' })
    expect(dangerBtn.className).toContain('bg-danger-600')
    expect(dangerBtn.className).toContain('h-11')
    expect(dangerBtn.className).toContain('w-full')
    expect(dangerBtn.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )

    rerender(
      <Button variant="outline" size="icon" aria-label="Adicionar item">
        +
      </Button>,
    )
    const iconBtn = screen.getByRole('button', { name: 'Adicionar item' })
    expect(iconBtn.className).toContain('border-border-default')
    expect(iconBtn.className).toContain('w-10')
  })
})

describe('ButtonLink', () => {
  it('renderiza link acessível com estilos compartilhados de botão', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/dashboard" variant="secondary" leftIcon={Plus}>
          Ir para painel
        </ButtonLink>
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Ir para painel' })
    expect(link).toHaveAttribute('href', '/dashboard')
    expect(link.className).toContain('bg-brand-50')
  })
})
