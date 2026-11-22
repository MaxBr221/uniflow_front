import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mail, Search } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/Button.tsx'
import { Input } from '@/components/Input.tsx'
import { useAppForm } from '@/lib/formConfig.ts'
import { z, zodResolver } from '@/lib/validation.ts'

describe('Input', () => {
  it('associa label ao input e exibe texto auxiliar via aria-describedby', () => {
    render(
      <Input
        label="E-mail acadêmico"
        placeholder="voce@universidade.edu.br"
        helperText="Use seu e-mail institucional."
        required
      />,
    )

    const input = screen.getByLabelText(/E-mail acadêmico/i)
    expect(input).toHaveAttribute('placeholder', 'voce@universidade.edu.br')
    expect(input).toBeRequired()
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).toHaveAccessibleDescription('Use seu e-mail institucional.')
  })

  it('exibe mensagem de erro acessível e marca aria-invalid', () => {
    render(
      <Input
        label="Nome da disciplina"
        helperText="Informe o nome completo."
        error="Nome da disciplina é obrigatório."
      />,
    )

    const input = screen.getByLabelText('Nome da disciplina')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Nome da disciplina é obrigatório.',
    )
    expect(
      screen.queryByText('Informe o nome completo.'),
    ).not.toBeInTheDocument()
  })

  it('alterna visibilidade da senha quando passwordToggle está ativo', async () => {
    const user = userEvent.setup()

    render(
      <Input type="password" label="Senha" passwordToggle leftIcon={Mail} />,
    )

    const input = screen.getByLabelText('Senha')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('aplica ícones, tamanhos e estado desabilitado corretamente', () => {
    render(<Input label="Buscar" size="lg" leftIcon={Search} disabled />)

    const input = screen.getByLabelText('Buscar')
    expect(input).toBeDisabled()
    expect(input.className).toContain('h-11')
    expect(input.className).toContain('pl-9')
  })

  it('integra corretamente com React Hook Form e Zod', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const schema = z.object({
      email: z.email({ error: 'Informe um e-mail válido.' }),
    })

    function TestForm() {
      const {
        register,
        handleSubmit,
        formState: { errors },
      } = useAppForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '' },
      })

      return (
        <form onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
          <Input
            label="E-mail"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit">Enviar</Button>
        </form>
      )
    }

    render(<TestForm />)

    await user.type(screen.getByLabelText('E-mail'), 'invalido')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Informe um e-mail válido.',
    )
    expect(onSubmit).not.toHaveBeenCalled()

    await user.clear(screen.getByLabelText('E-mail'))
    await user.type(screen.getByLabelText('E-mail'), 'estudante@uniflow.edu')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onSubmit).toHaveBeenCalledWith({ email: 'estudante@uniflow.edu' })
  })
})
