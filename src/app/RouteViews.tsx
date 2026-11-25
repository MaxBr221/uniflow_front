import {
  AlertTriangle,
  ArrowLeft,
  Compass,
  GraduationCap,
  LogIn,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Badge } from '@/components/Badge.tsx'
import { BrandLogo } from '@/components/BrandLogo.tsx'
import { ButtonLink } from '@/components/Button.tsx'
import { SPACING_CLASSES } from '@/styles/spacing.ts'

interface RouteCardProps {
  header?: ReactNode
  badge: string
  badgeIcon: LucideIcon
  title: string
  titleId: string
  description: string
  tone?: 'brand' | 'danger'
  centered?: boolean
  action?: ReactNode
}

function RouteCard({
  header,
  badge,
  badgeIcon,
  title,
  titleId,
  description,
  tone = 'brand',
  centered = false,
  action,
}: RouteCardProps) {
  const borderClass =
    tone === 'danger' ? 'border-danger-200' : 'border-border-subtle'

  return (
    <main className={SPACING_CLASSES.centeredShell}>
      <section
        className={`bg-surface-card w-full ${centered ? 'max-w-md text-center' : 'max-w-lg'} rounded-2xl border ${borderClass} ${SPACING_CLASSES.cardPadding} shadow-sm`}
        role={tone === 'danger' ? 'alert' : undefined}
        aria-labelledby={titleId}
      >
        {header ? <div className="mb-5">{header}</div> : null}
        <Badge
          tone={tone === 'danger' ? 'danger' : 'brand'}
          leftIcon={badgeIcon}
          uppercase
          className="mb-4"
        >
          {badge}
        </Badge>
        <h1
          id={titleId}
          className="font-display text-heading-md sm:text-heading-lg text-ink-primary mb-3 font-semibold"
        >
          {title}
        </h1>
        <p className="text-body-sm sm:text-body text-ink-secondary">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </section>
    </main>
  )
}

function BackHomeLink() {
  return (
    <ButtonLink to="/" leftIcon={ArrowLeft}>
      Voltar ao início
    </ButtonLink>
  )
}

export function BaseHomeView() {
  return (
    <RouteCard
      header={<BrandLogo size="md" showTagline />}
      badge="Plataforma acadêmica"
      badgeIcon={GraduationCap}
      titleId="app-title"
      title="Ambiente base configurado"
      description="Projeto inicializado com React, TypeScript, Vite, Tailwind CSS, React Router, Axios, TanStack Query, React Hook Form, Zod, Lucide React e identidade visual UniFlow."
      action={
        <div className={SPACING_CLASSES.inlineGroup}>
          <ButtonLink to="/login" leftIcon={LogIn}>
            Entrar
          </ButtonLink>
          <ButtonLink to="/cadastro" variant="outline" leftIcon={UserPlus}>
            Criar conta
          </ButtonLink>
        </div>
      }
    />
  )
}

export function NotFoundView() {
  return (
    <RouteCard
      badge="Erro 404"
      badgeIcon={Compass}
      titleId="not-found-title"
      title="Página não encontrada"
      description="O endereço acessado não existe ou ainda não foi implementado."
      centered
      action={<BackHomeLink />}
    />
  )
}

export function RouteErrorView() {
  const error = useRouteError()

  let title = 'Algo deu errado'
  let description =
    'Ocorreu um erro inesperado ao carregar esta rota. Tente novamente.'

  if (isRouteErrorResponse(error)) {
    title = `Erro ${error.status}`
    description = error.statusText || description
  } else if (error instanceof Error && error.message) {
    description = error.message
  }

  return (
    <RouteCard
      badge="Erro de navegação"
      badgeIcon={AlertTriangle}
      titleId="route-error-title"
      title={title}
      description={description}
      tone="danger"
      centered
      action={<BackHomeLink />}
    />
  )
}
