import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/Button.tsx'
import { Input } from '@/components/Input.tsx'
import { Modal } from '@/components/Modal.tsx'

describe('Modal', () => {
  it('não renderiza quando fechado e renderiza em portal acessível quando aberto', () => {
    const { container, rerender } = render(
      <Modal
        isOpen={false}
        onClose={vi.fn()}
        title="Nova disciplina"
        description="Informe os dados básicos."
      >
        <p>Conteúdo interno</p>
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(
      <Modal
        isOpen
        onClose={vi.fn()}
        title="Nova disciplina"
        description="Informe os dados básicos."
        size="lg"
      >
        <p>Conteúdo interno</p>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Nova disciplina' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription('Informe os dados básicos.')
    expect(dialog.className).toContain('sm:max-w-2xl')
    expect(container.contains(dialog)).toBe(false)
    expect(document.body.contains(dialog)).toBe(true)
  })

  it('suporta alertdialog sem título visível usando ariaLabel e sem botão fechar', () => {
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        role="alertdialog"
        size="sm"
        ariaLabel="Confirmar exclusão do semestre"
        showCloseButton={false}
        footer={
          <>
            <Button variant="outline">Cancelar</Button>
            <Button variant="danger">Excluir</Button>
          </>
        }
      >
        <p>Essa ação removerá o semestre permanentemente.</p>
      </Modal>,
    )

    const alertDialog = screen.getByRole('alertdialog', {
      name: 'Confirmar exclusão do semestre',
    })
    expect(alertDialog.className).toContain('sm:max-w-md')
    expect(
      screen.queryByRole('button', { name: 'Fechar modal' }),
    ).not.toBeInTheDocument()
    expect(
      within(alertDialog).getByRole('button', { name: 'Excluir' }),
    ).toBeInTheDocument()
  })

  it('fecha pelo botão fechar, tecla Escape e clique no backdrop respeitando props de bloqueio', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    const { rerender } = render(
      <Modal isOpen onClose={onClose} title="Editar prazo">
        <p>Detalhes do prazo</p>
      </Modal>,
    )

    await user.click(screen.getByRole('button', { name: 'Fechar modal' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)

    const dialog = screen.getByRole('dialog', { name: 'Editar prazo' })
    const backdrop = dialog.parentElement as HTMLElement

    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(3)

    // Arrastar de dentro do modal e soltar no backdrop não deve fechar
    fireEvent.mouseDown(screen.getByText('Detalhes do prazo'))
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(3)

    rerender(
      <Modal
        isOpen
        onClose={onClose}
        title="Editar prazo"
        closeOnEscape={false}
        closeOnOverlayClick={false}
      >
        <p>Detalhes do prazo</p>
      </Modal>,
    )

    await user.keyboard('{Escape}')
    await user.click(
      screen.getByRole('dialog', { name: 'Editar prazo' })
        .parentElement as HTMLElement,
    )
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('gerencia foco inicial, aprisiona navegação por Tab e restaura foco ao fechar', async () => {
    const user = userEvent.setup()

    function ControlledModalExample() {
      const [isOpen, setIsOpen] = useState(false)
      const [name, setName] = useState('')
      const inputRef = useRef<HTMLInputElement>(null)

      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Abrir modal</Button>
          <Button>Ação externa</Button>

          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Cadastrar semestre"
            initialFocusRef={inputRef}
            footer={<Button onClick={() => setIsOpen(false)}>Salvar</Button>}
          >
            <Input
              ref={inputRef}
              label="Nome do semestre"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Modal>
        </>
      )
    }

    render(<ControlledModalExample />)

    const triggerButton = screen.getByRole('button', { name: 'Abrir modal' })
    await user.click(triggerButton)

    const input = screen.getByLabelText('Nome do semestre')
    const closeButton = screen.getByRole('button', { name: 'Fechar modal' })
    const saveButton = screen.getByRole('button', { name: 'Salvar' })

    expect(input).toHaveFocus()

    // Digitar em Input controlado dentro do modal não deve perder ou roubar foco
    await user.type(input, '2026.2')
    expect(input).toHaveValue('2026.2')
    expect(input).toHaveFocus()

    await user.tab()
    expect(saveButton).toHaveFocus()

    await user.tab()
    expect(closeButton).toHaveFocus()

    await user.tab({ shift: true })
    expect(saveButton).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(triggerButton).toHaveFocus()
  })

  it('bloqueia scroll do body e fecha apenas o modal no topo em modais aninhados', async () => {
    const user = userEvent.setup()

    function NestedModalsExample() {
      const [parentOpen, setParentOpen] = useState(false)
      const [childOpen, setChildOpen] = useState(false)

      return (
        <>
          <Button onClick={() => setParentOpen(true)}>Abrir principal</Button>

          <Modal
            isOpen={parentOpen}
            onClose={() => setParentOpen(false)}
            title="Configurações"
          >
            <Button onClick={() => setChildOpen(true)}>
              Abrir confirmação
            </Button>

            <Modal
              isOpen={childOpen}
              onClose={() => setChildOpen(false)}
              size="sm"
              title="Confirmar ação"
            >
              <p>Deseja continuar?</p>
            </Modal>
          </Modal>
        </>
      )
    }

    document.body.style.overflow = 'auto'
    render(<NestedModalsExample />)

    expect(document.body.style.overflow).toBe('auto')

    await user.click(screen.getByRole('button', { name: 'Abrir principal' }))
    expect(document.body.style.overflow).toBe('hidden')

    await user.click(screen.getByRole('button', { name: 'Abrir confirmação' }))
    expect(screen.getAllByRole('dialog')).toHaveLength(2)

    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('dialog', { name: 'Confirmar ação' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Configurações' }),
    ).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('auto')
  })
})
