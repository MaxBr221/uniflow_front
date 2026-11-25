import { ArrowRight, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/Button.tsx'
import { ErrorState } from '@/components/ErrorState.tsx'
import { Input } from '@/components/Input.tsx'
import { AuthShell } from '@/features/auth/components/AuthShell.tsx'
import { useAppForm } from '@/lib/formConfig.ts'
import { SPACING_CLASSES } from '@/styles/spacing.ts'

export interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterPageProps {
  onSubmitRegister?: (values: RegisterFormValues) => Promise<void> | void
}

export function RegisterPage({ onSubmitRegister }: RegisterPageProps) {
  const [submitNotice, setSubmitNotice] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useAppForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function handleFormSubmit(values: RegisterFormValues): Promise<void> {
    setSubmitNotice(null)

    if (!onSubmitRegister) {
      setSubmitNotice(
        'O envio para a API será habilitado após a integração do contrato de autenticação (FE-034).',
      )
      return
    }

    await onSubmitRegister(values)
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
        className={SPACING_CLASSES.formStack}
        aria-label="Formulário de cadastro"
      >
        {submitNotice ? (
          <ErrorState
            variant="banner"
            tone="warning"
            size="sm"
            errorCode="FE-034"
            title="Integração pendente"
            description={submitNotice}
          />
        ) : null}

        <Input
          label="Nome completo"
          type="text"
          autoComplete="name"
          placeholder="Ex.: Ana Clara Silva"
          leftIcon={User}
          required
          disabled={isSubmitting}
          {...register('name')}
        />

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@universidade.edu.br"
          leftIcon={Mail}
          required
          disabled={isSubmitting}
          {...register('email')}
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="Crie uma senha segura"
          helperText="Use no mínimo 8 caracteres com letras e números."
          leftIcon={Lock}
          passwordToggle
          required
          disabled={isSubmitting}
          {...register('password')}
        />

        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita sua senha"
          leftIcon={Lock}
          passwordToggle
          required
          disabled={isSubmitting}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          rightIcon={ArrowRight}
          isLoading={isSubmitting}
          loadingText="Criando conta..."
          className="mt-stack-xs"
        >
          Criar conta
        </Button>
      </form>
    </AuthShell>
  )
}
