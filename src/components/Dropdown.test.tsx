import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExternalLink, LogOut, Pencil, Trash2, User } from 'lucide-react'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Dropdown, type DropdownItem } from '@/components/Dropdown.tsx'

describe('Dropdown', () => {
  it('abre e fecha ao clicar no trigger e ao clicar fora, exibindo itens, rótulos e separadores', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    const items: DropdownItem[] = [
      { id: 'section', type: 'label', label: 'Disciplina' },
      { id: 'edit', label: 'Editar', icon: Pencil, onSelect: onEdit },
      { id: 'sep', type: 'separator' },
      { id: 'delete', label: 'Excluir', icon: Trash2, tone: 'danger' },
    ]

    render(
      <div>
        <Dropdown label="Ações" items={items} />
        <button type="button">Fora do menu</button>
      </div>,
    )

    const trigger = screen.getByRole('button', { name: 'Ações' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu', { name: 'Ações' })).toBeInTheDocument()
    expect(screen.getByText('Disciplina')).toBeInTheDocument()
    expect(screen.getByRole('separator')).toBeInTheDocument()

    const deleteItem = screen.getByRole('menuitem', { name: 'Excluir' })
    expect(deleteItem.className).toContain('text-danger-600')

    await user.click(screen.getByRole('button', { name: 'Fora do menu' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('navega por teclado (ArrowDown, ArrowUp, Home, End, inicial e Escape)', async () => {
    const user = userEvent.setup()

    const items: DropdownItem[] = [
      { id: 'profile', label: 'Meu perfil', icon: User },
      { id: 'disabled', label: 'Plano Pro', disabled: true },
      { id: 'docs', label: 'Documentação' },
      { id: 'logout', label: 'Sair', icon: LogOut, tone: 'danger' },
    ]

    render(<Dropdown label="Conta" items={items} />)

    const trigger = screen.getByRole('button', { name: 'Conta' })
    trigger.focus()

    await user.keyboard('{ArrowDown}')
    const profileItem = screen.getByRole('menuitem', { name: 'Meu perfil' })
    const docsItem = screen.getByRole('menuitem', { name: 'Documentação' })
    const logoutItem = screen.getByRole('menuitem', { name: 'Sair' })

    expect(profileItem).toHaveFocus()

    // Deve pular o item desabilitado ("Plano Pro")
    await user.keyboard('{ArrowDown}')
    expect(docsItem).toHaveFocus()

    await user.keyboard('{End}')
    expect(logoutItem).toHaveFocus()

    await user.keyboard('{Home}')
    expect(profileItem).toHaveFocus()

    await user.keyboard('s')
    expect(logoutItem).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('respeita item disabled, closeOnSelect=false e estado selected', async () => {
    const user = userEvent.setup()
    const onDisabledClick = vi.fn()
    const onFilterToggle = vi.fn()

    render(
      <Dropdown
        label="Status"
        align="right"
        side="top"
        items={[
          {
            id: 'pending',
            label: 'Pendentes',
            selected: true,
            closeOnSelect: false,
            onSelect: onFilterToggle,
          },
          {
            id: 'archived',
            label: 'Arquivadas',
            disabled: true,
            onSelect: onDisabledClick,
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Status' }))

    const menu = screen.getByRole('menu', { name: 'Status' })
    expect(menu.className).toContain('right-0')
    expect(menu.className).toContain('bottom-full')

    const selectedItem = screen.getByRole('menuitem', { name: 'Pendentes' })
    expect(selectedItem.className).toContain('bg-brand-50')

    await user.click(selectedItem)
    expect(onFilterToggle).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    const disabledItem = screen.getByRole('menuitem', { name: 'Arquivadas' })
    expect(disabledItem).toBeDisabled()
    await user.click(disabledItem)
    expect(onDisabledClick).not.toHaveBeenCalled()
  })

  it('suporta links internos e externos, header, renderTrigger e modo controlado', async () => {
    const user = userEvent.setup()

    function ControlledProfileDropdown() {
      const [isOpen, setIsOpen] = useState(false)

      return (
        <MemoryRouter>
          <Dropdown
            open={isOpen}
            onOpenChange={setIsOpen}
            align="right"
            header={
              <div>
                <p>Maxsuel Lima</p>
                <p>estudante@ufpb.br</p>
              </div>
            }
            renderTrigger={({ isOpen: expanded, ...props }) => (
              <button type="button" {...props}>
                {expanded ? 'Fechar perfil' : 'Abrir perfil'}
              </button>
            )}
            items={[
              { id: 'panel', label: 'Ir para dashboard', to: '/dashboard' },
              {
                id: 'portal',
                label: 'Portal acadêmico',
                icon: ExternalLink,
                href: 'https://uniflow.app',
                target: '_blank',
              },
            ]}
          />
        </MemoryRouter>
      )
    }

    render(<ControlledProfileDropdown />)

    await user.click(screen.getByRole('button', { name: 'Abrir perfil' }))
    expect(
      screen.getByRole('button', { name: 'Fechar perfil' }),
    ).toBeInTheDocument()
    expect(screen.getByText('estudante@ufpb.br')).toBeInTheDocument()

    const routerLink = screen.getByRole('menuitem', {
      name: 'Ir para dashboard',
    })
    expect(routerLink).toHaveAttribute('href', '/dashboard')

    const externalLink = screen.getByRole('menuitem', {
      name: 'Portal acadêmico',
    })
    expect(externalLink).toHaveAttribute('href', 'https://uniflow.app')
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')

    await user.click(routerLink)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
