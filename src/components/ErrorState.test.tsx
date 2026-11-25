import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ErrorState } from '@/components/ErrorState.tsx'
import { HttpClientError } from '@/services/httpClient.ts'

describe('ErrorState', () => {
  it('renderiza estado de erro padrão acessível (card, tone danger, role alert)', () => {
    render(<ErrorState data-testid="error-default" />)

    const container = screen.getByRole('alert')
    expect(container).toBe(screen.getByTestId('error-default'))
    expect(container.className).toContain('bg-surface-card')
    expect(container.className).toContain('border-danger-200')
    expect(container.className).toContain('rounded-2xl')

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Não foi possível carregar os dados',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Ocorreu um erro inesperado ao buscar as informações. Tente novamente em instantes.',
      ),
    ).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('aciona onRetry e exibe estado de carregamento durante nova tentativa', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    const { rerender } = render(<ErrorState onRetry={onRetry} />)

    const retryButton = screen.getByRole('button', {
      name: 'Tentar novamente',
    })
    await user.click(retryButton)
    expect(onRetry).toHaveBeenCalledTimes(1)

    rerender(
      <ErrorState
        onRetry={onRetry}
        isRetrying
        retryingLabel="Recarregando..."
      />,
    )

    const loadingButton = screen.getByRole('button', {
      name: 'Recarregando...',
    })
    expect(loadingButton).toBeDisabled()
    expect(loadingButton).toHaveAttribute('aria-busy', 'true')
  })

  it('interpreta erros normais e HttpClientError (rede e status HTTP) permitindo sobrescritas', () => {
    const { rerender } = render(
      <ErrorState error={new Error('Tempo limite excedido')} />,
    )

    expect(screen.getByText('Tempo limite excedido')).toBeInTheDocument()

    rerender(
      <ErrorState
        error={
          new HttpClientError(
            'Não foi possível conectar ao servidor. Verifique sua conexão.',
            {
              status: null,
              code: 'ERR_NETWORK',
              isNetworkError: true,
            },
          )
        }
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Sem conexão com o servidor' }),
    ).toBeInTheDocument()
    expect(screen.getByText('ERR_NETWORK')).toBeInTheDocument()

    rerender(
      <ErrorState
        error={
          new HttpClientError('Recurso restrito ao dono da disciplina.', {
            status: 403,
            code: 'FORBIDDEN',
            isNetworkError: false,
          })
        }
        title="Permissão insuficiente"
        showErrorCode
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Permissão insuficiente' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Erro 403')).toBeInTheDocument()
    expect(
      screen.getByText('Recurso restrito ao dono da disciplina.'),
    ).toBeInTheDocument()
  })

  it('suporta variante banner com tom warning, variante plain, link secundário e ocultação de ícone', () => {
    const { rerender } = render(
      <MemoryRouter>
        <ErrorState
          variant="banner"
          tone="warning"
          size="sm"
          errorCode="AVISO"
          title="Sincronização pendente"
          description="Alguns dados locais ainda não foram enviados."
          onRetry={vi.fn()}
          secondaryAction={{ label: 'Voltar ao painel', to: '/dashboard' }}
        />
      </MemoryRouter>,
    )

    const banner = screen.getByRole('status')
    expect(banner.className).toContain('bg-warning-50')
    expect(banner.className).toContain('border-warning-200')
    expect(screen.getByText('AVISO')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Voltar ao painel' }),
    ).toHaveAttribute('href', '/dashboard')

    rerender(
      <ErrorState
        as="section"
        variant="plain"
        icon={null}
        title="Falha no bloco"
        description="Não foi possível exibir o gráfico."
      >
        <p>Detalhes adicionais do suporte.</p>
      </ErrorState>,
    )

    const region = screen.getByRole('alert', { name: 'Falha no bloco' })
    expect(region.tagName).toBe('SECTION')
    expect(region.className).toContain('bg-transparent')
    expect(region.querySelector('svg')).not.toBeInTheDocument()
    expect(
      screen.getByText('Detalhes adicionais do suporte.'),
    ).toBeInTheDocument()
  })
})
