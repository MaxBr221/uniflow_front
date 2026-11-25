import { ArrowRight, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/Button.tsx'
import { ErrorState } from '@/components/ErrorState.tsx'
import { Input } from '@/components/Input.tsx'
import { AuthShell } from '@/features/auth/components/AuthShell.tsx'
import { useRegisterMutation } from '@/features/auth/hooks/useRegisterMutation.ts'
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas/authSchemas.ts'
import { useToast } from '@/hooks/useToast.ts'
import {
  applyHttpFieldErrors,
  getFieldErrorMessage,
  useAppForm,
} from '@/lib/formConfig.ts'
import { zodResolver } from '@/lib/validation.ts'
import { SPACING_CLASSES } from '@/styles/spacing.ts'

export type { RegisterFormValues } from '@/features/auth/schemas/authSchemas.ts'

const BACKEND_FIELD_TO_FORM: Record<string, keyof RegisterFormValues> = {
  nome: 'name',
  email: 'email',
  senha: 'password',
}

export interface RegisterPageProps {
  onSubmitRegister?: (values: RegisterFormValues) => Promise<void> | void
}

export function RegisterPage({ onSubmitRegister }: RegisterPageProps) {
  const navigate = useNavigate()
  const { success } = useToast()
  const registerMutation = useRegisterMutation()
  const [submitError, setSubmitError] = useState<unknown>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useAppForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const isPending = isSubmitting || registerMutation.isPending

  async function handleFormSubmit(values: RegisterFormValues): Promise<void> {
    setSubmitError(null)
    registerMutation.reset()

    try {
      if (onSubmitRegister) {
        await onSubmitRegister(values)
        return
      }

      const createdUser = await registerMutation.mutateAsync(values)
      success('Conta criada com sucesso!', {
        description: `Bem-vindo(a), ${createdUser.nome}! Faça login para acessar sua conta.`,
      })
      navigate('/login', { state: { registeredEmail: createdUser.email } })
    } catch (error) {
      if (applyHttpFieldErrors(error, BACKEND_FIELD_TO_FORM, setError)) {
        setSubmitError(error)
      }
    }
  }

  return (
    <AuthShell
      badge="Novo cadastro"
      title="Criar conta"
      description="Preencha seus dados para começar a organizar seu semestre no UniFlow."
      footer={
        <>
          Já possui uma conta?{' '}
          <Link
            to="/login"
            className="text-brand-600 hover:text-brand-700 focus-visible:outline-border-focus font-semibold underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Entrar
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
        className={SPACING_CLASSES.formStack}
        aria-label="Formulário de cadastro"
      >
        {submitError ? (
          <ErrorState
            variant="banner"
            tone="danger"
            size="sm"
            error={submitError}
          />
        ) : null}

        <Input
          label="Nome completo"
          type="text"
          autoComplete="name"
          placeholder="Ex.: Ana Clara Silva"
          leftIcon={User}
          error={getFieldErrorMessage(errors.name)}
          required
          disabled={isPending}
          {...register('name')}
        />

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@universidade.edu.br"
          leftIcon={Mail}
          error={getFieldErrorMessage(errors.email)}
          required
          disabled={isPending}
          {...register('email')}
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="Crie uma senha segura"
          helperText="Use de 8 a 72 caracteres com maiúscula, minúscula, número e símbolo, sem espaços."
          leftIcon={Lock}
          passwordToggle
          error={getFieldErrorMessage(errors.password)}
          required
          disabled={isPending}
          {...register('password')}
        />

        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita sua senha"
          leftIcon={Lock}
          passwordToggle
          error={getFieldErrorMessage(errors.confirmPassword)}
          required
          disabled={isPending}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          rightIcon={ArrowRight}
          isLoading={isPending}
          loadingText="Criando conta..."
          className="mt-stack-xs"
        >
          Criar conta
        </Button>
      </form>
    </AuthShell>
  )
}
