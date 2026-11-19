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
import { env } from '@/lib/env.ts'

interface RouteCardProps {
  badge: string
  badgeIcon: LucideIcon
  title: string
  titleId: string
  description: string
  tone?: 'violet' | 'rose'
  centered?: boolean
  action?: ReactNode
}

function RouteCard({
  badge,
  badgeIcon,
  title,
  titleId,
  description,
  tone = 'violet',
  centered = false,
  action,
}: RouteCardProps) {
  const borderClass =
    tone === 'rose' ? 'border-rose-200' : 'border-violet-200/80'
  const badgeClass =
    tone === 'rose'
      ? 'bg-rose-100 text-rose-700'
      : 'bg-violet-100 text-violet-700'

  return (
    <main className="flex min-h-svh items-center justify-center p-4 sm:p-6">
      <section
        className={`w-full ${centered ? 'max-w-md text-center' : 'max-w-lg'} rounded-2xl border ${borderClass} bg-white p-6 shadow-sm sm:p-8`}
        role={tone === 'rose' ? 'alert' : undefined}
        aria-labelledby={titleId}
      >
        <span
          className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wider uppercase ${badgeClass}`}
        >
          <AppIcon icon={badgeIcon} size="xs" />
          {badge}
        </span>
        <h1
          id={titleId}
          className="mb-3 text-xl leading-snug font-semibold text-slate-900 sm:text-2xl"
        >
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
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
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
    >
      <AppIcon icon={ArrowLeft} size="sm" />
      Voltar ao início
    </Link>
  )
}

export function BaseHomeView() {
  return (
    <RouteCard
      badge={env.appName}
      badgeIcon={GraduationCap}
      titleId="app-title"
      title="Ambiente base configurado"
      description="Projeto inicializado com React, TypeScript, Vite, Tailwind CSS, React Router, Axios, TanStack Query, React Hook Form, Zod e Lucide React."
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
      tone="rose"
      centered
      action={<BackHomeLink />}
    />
  )
}
