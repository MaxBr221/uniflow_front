import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/Button.tsx'
import { Textarea } from '@/components/Textarea.tsx'
import { useAppForm } from '@/lib/formConfig.ts'
import { requiredTextSchema, z, zodResolver } from '@/lib/validation.ts'

describe('Textarea', () => {
  it('associa label, placeholder, rows padrão e helperText via aria-describedby', () => {
    render(
      <Textarea
        label="Descrição da atividade"
        placeholder="Detalhe os requisitos da entrega"
        helperText="Visível apenas para você."
        required
      />,
    )

    const textarea = screen.getByLabelText(/Descrição da atividade/i)
    expect(textarea).toHaveAttribute('rows', '4')
    expect(textarea).toBeRequired()
    expect(textarea).toHaveAccessibleDescription('Visível apenas para você.')
  })

  it('exibe erro acessível com aria-invalid e oculta helperText', () => {
    render(
      <Textarea
        label="Observações"
        helperText="Opcional."
        error="Observações devem ter no mínimo 10 caracteres."
      />,
    )

    const textarea = screen.getByLabelText('Observações')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Observações devem ter no mínimo 10 caracteres.',
    )
    expect(screen.queryByText('Opcional.')).not.toBeInTheDocument()
  })

  it('atualiza contador de caracteres ao digitar e aplica resize/disabled', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <Textarea
        label="Resumo"
        showCount
        maxLength={200}
        resize="none"
        size="lg"
      />,
    )

    expect(screen.getByText('0/200')).toBeInTheDocument()
    const textarea = screen.getByLabelText('Resumo')
    expect(textarea.className).toContain('resize-none')
    expect(textarea.className).toContain('min-h-28')

    await user.type(textarea, 'Entrega final')
    expect(screen.getByText('13/200')).toBeInTheDocument()

    rerender(<Textarea label="Resumo" disabled />)
    expect(screen.getByLabelText('Resumo')).toBeDisabled()
  })

  it('integra corretamente com React Hook Form e Zod', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const schema = z.object({
      notes: requiredTextSchema('Anotação'),
    })

    function TestForm() {
      const {
        register,
        handleSubmit,
        formState: { errors },
      } = useAppForm({
        resolver: zodResolver(schema),
        defaultValues: { notes: '' },
      })

      return (
        <form onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
          <Textarea
            label="Anotações do trabalho"
            error={errors.notes?.message}
            {...register('notes')}
          />
          <Button type="submit">Salvar</Button>
        </form>
      )
    }

    render(<TestForm />)

    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Anotação é obrigatório.',
    )
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(
      screen.getByLabelText('Anotações do trabalho'),
      'Revisar referências bibliográficas.',
    )
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      notes: 'Revisar referências bibliográficas.',
    })
  })
})
