import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppRoute } from '@/test/renderWithProviders.tsx'

describe('Rotas base da aplicação', () => {
  it('renderiza a página inicial na rota raiz e navega entre /login e /cadastro', async () => {
    const { user } = renderAppRoute(['/'])

    expect(
      screen.getByRole('heading', { name: 'Ambiente base configurado' }),
    ).toBeInTheDocument()
    expect(screen.getByText('UniFlow')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Entrar' }))
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Entrar no UniFlow',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Criar conta' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Criar conta' }),
    ).toBeInTheDocument()
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
