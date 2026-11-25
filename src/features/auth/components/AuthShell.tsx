import { BookOpen, CalendarDays, CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { AppIcon } from '@/components/AppIcon.tsx'
import { Badge } from '@/components/Badge.tsx'
import { BrandLogo } from '@/components/BrandLogo.tsx'
import { Card } from '@/components/Card.tsx'
import { ResponsiveContainer } from '@/components/Responsive.tsx'
import { TYPOGRAPHY_CLASSES } from '@/styles/typography.ts'

const AUTH_HIGHLIGHTS = [
  {
    icon: BookOpen,
    title: 'Disciplinas e semestres organizados',
    description:
      'Centralize matérias, horários de aula e entregas de cada período letivo.',
  },
  {
    icon: CalendarDays,
    title: 'Prazos sempre visíveis',
    description:
      'Antecipe provas, listas e trabalhos com alertas claros antes do vencimento.',
  },
  {
    icon: CheckCircle2,
    title: 'Trabalhos divididos em etapas',
    description:
      'Acompanhe o progresso de projetos individuais ou em grupo sem perder o ritmo.',
  },
] as const

export interface AuthShellProps {
  badge?: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({
  badge = 'Área do estudante',
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="bg-surface-canvas min-h-svh">
      <ResponsiveContainer
        as="main"
        size="wide"
        centered
        className="max-w-5xl py-inset-lg lg:py-inset-xl"
      >
        <div className="gap-stack-xl grid w-full grid-cols-1 items-center lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:gap-12">
          <aside className="space-y-stack-lg hidden lg:block">
            <BrandLogo size="lg" showTagline />

            <div className="space-y-stack-sm max-w-md">
              <Badge tone="brand" uppercase>
                Organização universitária
              </Badge>
              <h2 className="font-display text-display text-ink-primary font-bold">
                Seu semestre inteiro em um único fluxo calmo.
              </h2>
              <p className={TYPOGRAPHY_CLASSES.body}>
                Planeje sua rotina acadêmica sem planilhas dispersas e mantenha
                aulas, atividades e trabalhos sob controle.
              </p>
            </div>

            <ul className="space-y-stack-md max-w-md">
              {AUTH_HIGHLIGHTS.map((highlight) => (
                <li
                  key={highlight.title}
                  className="gap-stack-sm flex items-start"
                >
                  <span
                    aria-hidden="true"
                    className="bg-brand-100 text-brand-700 mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  >
                    <AppIcon icon={highlight.icon} size="sm" />
                  </span>
                  <div className="space-y-stack-xs min-w-0">
                    <p className={TYPOGRAPHY_CLASSES.label}>
                      {highlight.title}
                    </p>
                    <p className={TYPOGRAPHY_CLASSES.bodySm}>
                      {highlight.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <div className="mb-stack-lg flex flex-col items-center text-center lg:hidden">
              <BrandLogo size="md" showTagline />
            </div>

            <Card padding="default" elevation="md" className="w-full">
              <div className="space-y-stack-sm">
                <Badge tone="brand" size="sm" uppercase>
                  {badge}
                </Badge>
                <div className="space-y-stack-xs">
                  <h1 className="font-display text-heading-lg text-ink-primary font-semibold">
                    {title}
                  </h1>
                  <p className={TYPOGRAPHY_CLASSES.bodySm}>{description}</p>
                </div>
              </div>

              <div>{children}</div>

              {footer ? (
                <div className="border-border-subtle pt-stack-md text-body-sm text-ink-secondary border-t text-center">
                  {footer}
                </div>
              ) : null}
            </Card>

            <p className="mt-stack-md text-caption text-ink-muted text-center">
              <Link
                to="/"
                className="hover:text-brand-700 focus-visible:outline-border-focus underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Voltar à página inicial
              </Link>
            </p>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  )
}
