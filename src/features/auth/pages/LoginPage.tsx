import { ArrowRight, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/Button.tsx'
import { ErrorState } from '@/components/ErrorState.tsx'
import { Input } from '@/components/Input.tsx'
import { AuthShell } from '@/features/auth/components/AuthShell.tsx'
import { useLoginMutation } from '@/features/auth/hooks/useLoginMutation.ts'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/authSchemas.ts'
import { useToast } from '@/hooks/useToast.ts'
import {
  applyHttpFieldErrors,
  getFieldErrorMessage,
  useAppForm,
} from '@/lib/formConfig.ts'
import { zodResolver } from '@/lib/validation.ts'
import { SPACING_CLASSES } from '@/styles/spacing.ts'

export type { LoginFormValues } from '@/features/auth/schemas/authSchemas.ts'

const BACKEND_LOGIN_FIELD_TO_FORM: Record<string, keyof LoginFormValues> = {
  email: 'email',
  senha: 'password',
}

export interface LoginPageProps {
  onSubmitLogin?: (values: LoginFormValues) => Promise<void> | void
}

function getPrefilledEmail(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'registeredEmail' in state &&
    typeof state.registeredEmail === 'string'
  ) {
    return state.registeredEmail
  }
  return ''
}

function getRedirectTarget(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string' &&
    state.from.startsWith('/') &&
    !state.from.startsWith('//')
  ) {
    return state.from
  }
  return '/'
}

export function LoginPage({ onSubmitLogin }: LoginPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { success } = useToast()
  const loginMutation = useLoginMutation()
  const [submitError, setSubmitError] = useState<unknown>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useAppForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: getPrefilledEmail(location.state),
      password: '',
    },
  })

  const isPending = isSubmitting || loginMutation.isPending

  async function handleFormSubmit(values: LoginFormValues): Promise<void> {
    setSubmitError(null)
    loginMutation.reset()

    try {
      if (onSubmitLogin) {
        await onSubmitLogin(values)
        return
      }

      const tokenResponse = await loginMutation.mutateAsync(values)
      success('Login realizado com sucesso!', {
        description: `Bem-vindo(a), ${tokenResponse.usuario.nome}!`,
      })
      navigate(getRedirectTarget(location.state), { replace: true })
    } catch (error) {
      if (applyHttpFieldErrors(error, BACKEND_LOGIN_FIELD_TO_FORM, setError)) {
        setSubmitError(error)
      }
    }
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
        noValidate
        className={SPACING_CLASSES.formStack}
        aria-label="Formulário de login"
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

        <div className="space-y-stack-xs">
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            leftIcon={Lock}
            passwordToggle
            error={getFieldErrorMessage(errors.password)}
            required
            disabled={isPending}
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
          isLoading={isPending}
          loadingText="Entrando..."
        >
          Entrar
        </Button>
      </form>
    </AuthShell>
  )
}
