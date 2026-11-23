import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/Button.tsx'
import { ToastProvider } from '@/components/Toast.tsx'
import { useToast } from '@/hooks/useToast.ts'
import { toast } from '@/lib/toast.ts'

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('exibe toasts semânticos (success, error, warning, info) via useToast e fecha manualmente', async () => {
    const user = userEvent.setup()

    function ToastDemo() {
      const { success, error, warning, info } = useToast()

      return (
        <div>
          <Button
            onClick={() =>
              success('Semestre salvo', { description: '2026.2 ativo.' })
            }
          >
            Sucesso
          </Button>
          <Button onClick={() => error('Falha ao conectar')}>Erro</Button>
          <Button onClick={() => warning('Prazo próximo')}>Alerta</Button>
          <Button onClick={() => info('Sincronizando horários')}>Info</Button>
        </div>
      )
    }

    render(
      <ToastProvider position="bottom-right">
        <ToastDemo />
      </ToastProvider>,
    )

    const region = screen.getByRole('region', { name: 'Notificações' })
    expect(region.className).toContain('bottom-inset-sm')
    expect(region.className).toContain('sm:right-inset-lg')

    await user.click(screen.getByRole('button', { name: 'Sucesso' }))
    const statusToast = within(region).getByRole('status')
    expect(statusToast).toHaveTextContent('Semestre salvo')
    expect(statusToast).toHaveTextContent('2026.2 ativo.')
    expect(statusToast.className).toContain('border-success-200')

    await user.click(screen.getByRole('button', { name: 'Erro' }))
    const alertToast = within(region).getByRole('alert')
    expect(alertToast).toHaveTextContent('Falha ao conectar')
    expect(alertToast.className).toContain('border-danger-200')

    await user.click(screen.getByRole('button', { name: 'Alerta' }))
    await user.click(screen.getByRole('button', { name: 'Info' }))
    expect(within(region).getAllByRole('status')).toHaveLength(3)

    const closeButtons = within(region).getAllByRole('button', {
      name: 'Fechar notificação',
    })
    await user.click(closeButtons[0])
    expect(screen.queryByText('Semestre salvo')).not.toBeInTheDocument()
  })

  it('faz auto-dismiss no tempo configurado e pausa/retoma ao passar o mouse ou focar', () => {
    vi.useFakeTimers()

    render(
      <ToastProvider>
        <div>Conteúdo</div>
      </ToastProvider>,
    )

    act(() => {
      toast.info('Atividade concluída', { durationMs: 3000 })
    })

    const toastNode = screen.getByRole('status')
    expect(toastNode).toHaveTextContent('Atividade concluída')

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByText('Atividade concluída')).toBeInTheDocument()

    // Pausa ao passar o mouse: não deve fechar mesmo após passar mais de 3000ms
    fireEvent.mouseEnter(toastNode)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByText('Atividade concluída')).toBeInTheDocument()

    // Retoma os ~1500ms restantes ao sair o mouse
    fireEvent.mouseLeave(toastNode)
    act(() => {
      vi.advanceTimersByTime(1400)
    })
    expect(screen.getByText('Atividade concluída')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.queryByText('Atividade concluída')).not.toBeInTheDocument()
  })

  it('suporta ação interativa, toasts persistentes, atualização por ID e limite maxVisible', async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()

    render(
      <ToastProvider maxVisible={2}>
        <div>App</div>
      </ToastProvider>,
    )

    act(() => {
      toast.success('Disciplina arquivada', {
        id: 'archive-1',
        durationMs: 0,
        dismissible: false,
        action: { label: 'Desfazer', onClick: onUndo },
      })
    })

    expect(
      screen.queryByRole('button', { name: 'Fechar notificação' }),
    ).not.toBeInTheDocument()

    // Atualiza o mesmo toast pelo ID em vez de duplicar
    act(() => {
      toast.warning('Disciplina removida', {
        id: 'archive-1',
        durationMs: 0,
        action: { label: 'Desfazer', onClick: onUndo },
      })
    })

    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByText('Disciplina removida')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Desfazer' }))
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Disciplina removida')).not.toBeInTheDocument()

    act(() => {
      toast.info('Notificação 1')
      toast.info('Notificação 2')
      toast.info('Notificação 3')
    })

    // maxVisible=2 mantém visíveis os 2 toasts mais recentes
    expect(screen.queryByText('Notificação 1')).not.toBeInTheDocument()
    expect(screen.getByText('Notificação 2')).toBeInTheDocument()
    expect(screen.getByText('Notificação 3')).toBeInTheDocument()
  })
})
