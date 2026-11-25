import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { RegisterPage } from '@/features/auth/pages/RegisterPage.tsx'

describe('RegisterPage', () => {
  it('renderiza campos do formulário de cadastro, alternância de senha e links de navegação', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Criar conta' }),
    ).toBeInTheDocument()

    const nameInput = screen.getByLabelText(/Nome completo/i)
    const emailInput = screen.getByLabelText(/E-mail/i)
    const passwordInput = screen.getByLabelText(/^Senha/i)
    const confirmPasswordInput = screen.getByLabelText(/Confirmar senha/i)

    expect(nameInput).toHaveAttribute('autocomplete', 'name')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')

    const toggleButtons = screen.getAllByRole('button', {
      name: 'Mostrar senha',
    })
    expect(toggleButtons).toHaveLength(2)

    await user.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute('type', 'text')

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(
      screen.getByRole('link', { name: 'Voltar à página inicial' }),
    ).toHaveAttribute('href', '/')
  })

  it('coleta os dados digitados e encaminha para onSubmitRegister ou exibe aviso quando sem integração', async () => {
    const user = userEvent.setup()
    const onSubmitRegister = vi.fn()

    const { rerender } = render(
      <MemoryRouter>
        <RegisterPage onSubmitRegister={onSubmitRegister} />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/Nome completo/i), 'Ana Clara Silva')
    await user.type(screen.getByLabelText(/E-mail/i), 'ana@ufpb.br')
    await user.type(screen.getByLabelText(/^Senha/i), 'UniFlow2026')
    await user.type(screen.getByLabelText(/Confirmar senha/i), 'UniFlow2026')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(onSubmitRegister).toHaveBeenCalledWith({
      name: 'Ana Clara Silva',
      email: 'ana@ufpb.br',
      password: 'UniFlow2026',
      confirmPassword: 'UniFlow2026',
    })

    rerender(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      /Integração pendente/i,
    )
  })
})
