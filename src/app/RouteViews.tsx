import {
  AlertTriangle,
  ArrowLeft,
  Compass,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { AppIcon } from '@/components/AppIcon.tsx'
import { BrandLogo } from '@/components/BrandLogo.tsx'

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
  const badgeClass =
    tone === 'danger'
      ? 'bg-danger-100 text-danger-700'
      : 'bg-brand-100 text-brand-700'

  return (
    <main className="flex min-h-svh items-center justify-center p-4 sm:p-6">
      <section
        className={`bg-surface-card w-full ${centered ? 'max-w-md text-center' : 'max-w-lg'} rounded-2xl border ${borderClass} p-6 shadow-sm sm:p-8`}
        role={tone === 'danger' ? 'alert' : undefined}
        aria-labelledby={titleId}
      >
        {header ? <div className="mb-5">{header}</div> : null}
        <span
          className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wider uppercase ${badgeClass}`}
        >
          <AppIcon icon={badgeIcon} size="xs" />
          {badge}
        </span>
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
    <Link
      to="/"
      className="bg-brand-600 text-ink-inverse hover:bg-brand-700 focus-visible:outline-border-focus inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <AppIcon icon={ArrowLeft} size="sm" />
      Voltar ao início
    </Link>
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
