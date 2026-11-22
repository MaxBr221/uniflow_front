import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookOpen } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/Button.tsx'
import { Select, type SelectOption } from '@/components/Select.tsx'
import { useAppForm } from '@/lib/formConfig.ts'
import { requiredTextSchema, z, zodResolver } from '@/lib/validation.ts'

const SEMESTER_OPTIONS: readonly SelectOption[] = [
  { value: '2026-1', label: '2026.1' },
  { value: '2026-2', label: '2026.2' },
  { value: '2027-1', label: '2027.1 (bloqueado)', disabled: true },
]

describe('Select', () => {
  it('associa label, placeholder e opções corretamente', () => {
    render(
      <Select
        label="Semestre"
        placeholder="Selecione um semestre"
        helperText="Filtra as disciplinas do período."
        options={SEMESTER_OPTIONS}
        defaultValue=""
      />,
    )

    const select = screen.getByLabelText('Semestre')
    expect(select).toHaveAccessibleDescription(
      'Filtra as disciplinas do período.',
    )
    expect(screen.getAllByRole('option')).toHaveLength(4)
    expect(
      screen.getByRole('option', { name: '2027.1 (bloqueado)' }),
    ).toBeDisabled()
  })

  it('exibe erro acessível com aria-invalid e oculta helperText', () => {
    render(
      <Select
        label="Disciplina"
        helperText="Escolha a disciplina."
        error="Disciplina é obrigatória."
        options={[{ value: 'alg', label: 'Algoritmos' }]}
      />,
    )

    const select = screen.getByLabelText('Disciplina')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Disciplina é obrigatória.',
    )
    expect(screen.queryByText('Escolha a disciplina.')).not.toBeInTheDocument()
  })

  it('aceita children customizados, leftIcon, tamanho e estado disabled', () => {
    render(
      <Select label="Tipo" size="lg" leftIcon={BookOpen} disabled>
        <optgroup label="Avaliações">
          <option value="prova">Prova</option>
        </optgroup>
      </Select>,
    )

    const select = screen.getByLabelText('Tipo')
    expect(select).toBeDisabled()
    expect(select.className).toContain('h-11')
    expect(select.className).toContain('pl-9')
    expect(screen.getByRole('option', { name: 'Prova' })).toBeInTheDocument()
  })

  it('integra corretamente com React Hook Form e Zod', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const schema = z.object({
      semester: requiredTextSchema('Semestre'),
    })

    function TestForm() {
      const {
        register,
        handleSubmit,
        formState: { errors },
      } = useAppForm({
        resolver: zodResolver(schema),
        defaultValues: { semester: '' },
      })

      return (
        <form onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
          <Select
            label="Semestre letivo"
            placeholder="Selecione"
            required
            options={SEMESTER_OPTIONS}
            error={errors.semester?.message}
            {...register('semester')}
          />
          <Button type="submit">Continuar</Button>
        </form>
      )
    }

    render(<TestForm />)

    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Semestre é obrigatório.',
    )
    expect(onSubmit).not.toHaveBeenCalled()

    await user.selectOptions(
      screen.getByLabelText(/Semestre letivo/i),
      '2026-2',
    )
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(onSubmit).toHaveBeenCalledWith({ semester: '2026-2' })
  })
})
