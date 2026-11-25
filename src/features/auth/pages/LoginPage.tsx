import { ArrowRight, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/Button.tsx'
import { ErrorState } from '@/components/ErrorState.tsx'
import { Input } from '@/components/Input.tsx'
import { AuthShell } from '@/features/auth/components/AuthShell.tsx'
import { useAppForm } from '@/lib/formConfig.ts'
import { SPACING_CLASSES } from '@/styles/spacing.ts'

export interface LoginFormValues {
  email: string
  password: string
}

export interface LoginPageProps {
  onSubmitLogin?: (values: LoginFormValues) => Promise<void> | void
}

export function LoginPage({ onSubmitLogin }: LoginPageProps) {
  const [submitNotice, setSubmitNotice] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useAppForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function handleFormSubmit(values: LoginFormValues): Promise<void> {
    setSubmitNotice(null)

    if (!onSubmitLogin) {
      setSubmitNotice(
        'A autenticação com a API será habilitada após a integração do contrato de autenticação (FE-035).',
      )
      return
    }

    await onSubmitLogin(values)
  }

  return (
    <AuthShell
      badge="Acesso à conta"
      title="Entrar no UniFlow"
      description="Informe seu e-mail e senha para acompanhar suas disciplinas, aulas e entregas."
      footer={
        <>
          Ainda não possui uma conta?{' '}
          <Link
            to="/cadastro"
            className="text-brand-600 hover:text-brand-700 focus-visible:outline-border-focus font-semibold underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className={SPACING_CLASSES.formStack}
        aria-label="Formulário de login"
      >
        {submitNotice ? (
          <ErrorState
            variant="banner"
            tone="warning"
            size="sm"
            errorCode="FE-035"
            title="Integração pendente"
            description={submitNotice}
          />
        ) : null}

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

        <div className="space-y-stack-xs">
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            leftIcon={Lock}
            passwordToggle
            required
            disabled={isSubmitting}
            {...register('password')}
          />
          <div className="flex justify-end">
            <Link
              to="/recuperar-senha"
              className="text-caption text-brand-600 hover:text-brand-700 focus-visible:outline-border-focus font-medium underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          rightIcon={ArrowRight}
          isLoading={isSubmitting}
          loadingText="Entrando..."
        >
          Entrar
        </Button>
      </form>
    </AuthShell>
  )
}
