import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from '@/features/auth/pages/LoginPage.tsx'

describe('LoginPage', () => {
  it('renderiza campos de login, alternância de senha e links de navegação', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Entrar no UniFlow' }),
    ).toBeInTheDocument()

    const emailInput = screen.getByLabelText(/E-mail/i)
    const passwordInput = screen.getByLabelText(/^Senha/i)

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autocomplete', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    expect(
      screen.getByRole('link', { name: 'Esqueci minha senha' }),
    ).toHaveAttribute('href', '/recuperar-senha')
    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/cadastro',
    )
    expect(
      screen.getByRole('link', { name: 'Voltar à página inicial' }),
    ).toHaveAttribute('href', '/')
  })

  it('envia credenciais digitadas para onSubmitLogin ou exibe aviso quando sem integração', async () => {
    const user = userEvent.setup()
    const onSubmitLogin = vi.fn()

    const { rerender } = render(
      <MemoryRouter>
        <LoginPage onSubmitLogin={onSubmitLogin} />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/E-mail/i), 'ana@ufpb.br')
    await user.type(screen.getByLabelText(/^Senha/i), 'UniFlow2026')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(onSubmitLogin).toHaveBeenCalledWith({
      email: 'ana@ufpb.br',
      password: 'UniFlow2026',
    })

    rerender(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      /Integração pendente/i,
    )
  })
})
