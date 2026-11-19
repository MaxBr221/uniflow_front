import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppRoute } from '@/test/renderWithProviders.tsx'

describe('Rotas base da aplicação', () => {
  it('renderiza a página inicial na rota raiz', () => {
    renderAppRoute(['/'])

    expect(
      screen.getByRole('heading', { name: 'Ambiente base configurado' }),
    ).toBeInTheDocument()
    expect(screen.getByText('UniFlow')).toBeInTheDocument()
  })

  it('exibe página 404 para rotas inexistentes e permite voltar ao início', async () => {
    const { user } = renderAppRoute(['/rota-que-nao-existe'])

    expect(
      screen.getByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument()

    const backLink = screen.getByRole('link', { name: 'Voltar ao início' })
    expect(backLink).toHaveAttribute('href', '/')

    await user.click(backLink)

    expect(
      await screen.findByRole('heading', { name: 'Ambiente base configurado' }),
    ).toBeInTheDocument()
  })
})
