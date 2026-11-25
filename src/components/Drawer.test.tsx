import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/Button.tsx'
import { Drawer } from '@/components/Drawer.tsx'
import { Modal } from '@/components/Modal.tsx'

describe('Drawer', () => {
  it('renderiza em portal acessível conforme posicionamento (left, right, bottom) e tamanho', () => {
    const { rerender } = render(
      <Drawer
        isOpen
        onClose={vi.fn()}
        placement="left"
        size="sm"
        title="Navegação UniFlow"
        description="Acesse suas áreas acadêmicas."
      >
        <a href="/dashboard">Dashboard</a>
      </Drawer>,
    )

    const leftDrawer = screen.getByRole('dialog', { name: 'Navegação UniFlow' })
    expect(leftDrawer).toHaveAttribute('aria-modal', 'true')
    expect(leftDrawer.className).toContain('border-r')
    expect(leftDrawer.className).toContain('sm:max-w-xs')
    expect(leftDrawer.parentElement?.className).toContain('justify-start')

    rerender(
      <Drawer
        isOpen
        onClose={vi.fn()}
        placement="bottom"
        size="lg"
        ariaLabel="Filtros de atividades"
      >
        <p>Filtros rápidos</p>
      </Drawer>,
    )

    const bottomDrawer = screen.getByRole('dialog', {
      name: 'Filtros de atividades',
    })
    expect(bottomDrawer.className).toContain('rounded-t-2xl')
    expect(bottomDrawer.className).toContain('max-h-[92svh]')
    expect(bottomDrawer.parentElement?.className).toContain('items-end')
  })

  it('aprisiona foco, fecha pelo botão/Escape/backdrop e coordena pilha com Modal aninhado', async () => {
    const user = userEvent.setup()

    function DrawerWithModalDemo() {
      const [drawerOpen, setDrawerOpen] = useState(false)
      const [modalOpen, setModalOpen] = useState(false)

      return (
        <>
          <Button onClick={() => setDrawerOpen(true)}>Abrir menu</Button>

          <Drawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            placement="right"
            title="Filtros"
            footer={
              <Button onClick={() => setModalOpen(true)}>Salvar filtro</Button>
            }
          >
            <Button onClick={() => setModalOpen(true)}>Abrir ajuda</Button>

            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Ajuda dos filtros"
              size="sm"
            >
              <p>Combine disciplina e período.</p>
            </Modal>
          </Drawer>
        </>
      )
    }

    document.body.style.overflow = 'auto'
    render(<DrawerWithModalDemo />)

    const trigger = screen.getByRole('button', { name: 'Abrir menu' })
    await user.click(trigger)

    expect(document.body.style.overflow).toBe('hidden')
    const helpBtn = screen.getByRole('button', { name: 'Abrir ajuda' })
    const closeDrawerBtn = screen.getByRole('button', {
      name: 'Fechar painel',
    })
    expect(helpBtn).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Salvar filtro' })).toHaveFocus()
    await user.tab()
    expect(closeDrawerBtn).toHaveFocus()

    await user.click(helpBtn)
    expect(screen.getAllByRole('dialog')).toHaveLength(2)

    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('dialog', { name: 'Ajuda dos filtros' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('auto')
    expect(trigger).toHaveFocus()
  })
})
