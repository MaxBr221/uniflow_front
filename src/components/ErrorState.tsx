import {
  AlertCircle,
  AlertTriangle,
  RotateCw,
  ShieldAlert,
  WifiOff,
  type LucideIcon,
} from 'lucide-react'
import { useId, type HTMLAttributes, type ReactNode } from 'react'
import { Badge } from '@/components/Badge.tsx'
import {
  FeedbackActionsGroup,
  FeedbackMedallion,
  FeedbackStateContainer,
  FeedbackTextBlock,
  type FeedbackAction,
  type FeedbackAs,
  type FeedbackButtonAction,
  type FeedbackHeadingAs,
  type FeedbackLinkAction,
  type FeedbackSize,
} from '@/components/FeedbackState.tsx'
import {
  normalizeHttpError,
  type HttpClientError,
} from '@/services/httpClient.ts'
import { cn } from '@/utils/cn.ts'

export type ErrorStateVariant = 'card' | 'plain' | 'banner'
export type ErrorStateSize = FeedbackSize
export type ErrorStateTone = 'danger' | 'warning'
export type ErrorStateAs = FeedbackAs
export type ErrorStateHeadingAs = FeedbackHeadingAs
export type ErrorStateButtonAction = FeedbackButtonAction
export type ErrorStateLinkAction = FeedbackLinkAction
export type ErrorStateAction = FeedbackAction

const DEFAULT_ERROR_TITLE = 'Não foi possível carregar os dados'
const DEFAULT_ERROR_DESCRIPTION =
  'Ocorreu um erro inesperado ao buscar as informações. Tente novamente em instantes.'

const VARIANT_CLASSES: Record<
  ErrorStateVariant,
  Record<ErrorStateTone, string>
> = {
  card: {
    danger: 'bg-surface-card border-danger-200 rounded-2xl border shadow-xs',
    warning: 'bg-surface-card border-warning-200 rounded-2xl border shadow-xs',
  },
  plain: {
    danger: 'bg-transparent border-0',
    warning: 'bg-transparent border-0',
  },
  banner: {
    danger: 'bg-danger-50 border-danger-200 rounded-xl border',
    warning: 'bg-warning-50 border-warning-200 rounded-xl border',
  },
}

const TONE_MEDALLION_CLASSES: Record<ErrorStateTone, string> = {
  danger: 'bg-danger-100 border-danger-200 text-danger-600',
  warning: 'bg-warning-100 border-warning-200 text-warning-700',
}

interface ResolvedErrorDetails {
  title: string
  description: string
  icon: LucideIcon
  codeLabel: string | null
}

function getDefaultErrorIcon(
  tone: ErrorStateTone,
  normalized: HttpClientError | null,
): LucideIcon {
  if (normalized?.isNetworkError) {
    return WifiOff
  }
  if (normalized?.status === 403) {
    return ShieldAlert
  }
  return tone === 'warning' ? AlertTriangle : AlertCircle
}

function resolveErrorDetails(
  error: unknown,
  tone: ErrorStateTone,
): ResolvedErrorDetails {
  if (typeof error === 'string' && error.trim().length > 0) {
    return {
      title: DEFAULT_ERROR_TITLE,
      description: error.trim(),
      icon: getDefaultErrorIcon(tone, null),
      codeLabel: null,
    }
  }

  if (error === undefined || error === null) {
    return {
      title: DEFAULT_ERROR_TITLE,
      description: DEFAULT_ERROR_DESCRIPTION,
      icon: getDefaultErrorIcon(tone, null),
      codeLabel: null,
    }
  }

  const normalized = normalizeHttpError(error)

  let title = DEFAULT_ERROR_TITLE
  if (normalized.isNetworkError) {
    title = 'Sem conexão com o servidor'
  } else if (normalized.status === 403) {
    title = 'Acesso não permitido'
  } else if (normalized.status === 404) {
    title = 'Conteúdo não encontrado'
  } else if (normalized.status !== null && normalized.status >= 500) {
    title = 'Erro interno do servidor'
  }

  const codeLabel =
    normalized.status !== null
      ? `Erro ${normalized.status}`
      : normalized.code
        ? normalized.code
        : null

  return {
    title,
    description: normalized.message || DEFAULT_ERROR_DESCRIPTION,
    icon: getDefaultErrorIcon(tone, normalized),
    codeLabel,
  }
}

export interface ErrorStateProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  title?: ReactNode
  description?: ReactNode
  error?: unknown
  errorCode?: string
  showErrorCode?: boolean
  icon?: LucideIcon | null
  variant?: ErrorStateVariant
  size?: ErrorStateSize
  tone?: ErrorStateTone
  as?: ErrorStateAs
  headingAs?: ErrorStateHeadingAs
  onRetry?: () => void
  retryLabel?: string
  retryingLabel?: string
  isRetrying?: boolean
  action?: ErrorStateAction
  secondaryAction?: ErrorStateAction
  actions?: ReactNode
  children?: ReactNode
}

export function ErrorState({
  title,
  description,
  error,
  errorCode,
  showErrorCode = true,
  icon,
  variant = 'card',
  size = 'md',
  tone = 'danger',
  as = 'div',
  headingAs = 'h3',
  onRetry,
  retryLabel = 'Tentar novamente',
  retryingLabel = 'Tentando...',
  isRetrying = false,
  action,
  secondaryAction,
  actions,
  children,
  role,
  className,
  ...props
}: ErrorStateProps) {
  const generatedTitleId = useId()
  const titleId = props['aria-labelledby'] ?? generatedTitleId
  const resolved = resolveErrorDetails(error, tone)

  const effectiveTitle = title ?? resolved.title
  const effectiveDescription =
    description !== undefined ? description : resolved.description
  const effectiveIcon = icon === undefined ? resolved.icon : icon
  const effectiveCode = errorCode ?? (showErrorCode ? resolved.codeLabel : null)

  const resolvedAction: ErrorStateAction | undefined =
    action ??
    (onRetry
      ? {
          label: retryLabel,
          icon: RotateCw,
          onClick: onRetry,
          isLoading: isRetrying,
          loadingText: retryingLabel,
        }
      : undefined)

  const badge = effectiveCode ? (
    <Badge tone={tone} size="sm" mono>
      {effectiveCode}
    </Badge>
  ) : null

  const resolvedRole = role ?? (tone === 'danger' ? 'alert' : 'status')

  if (variant === 'banner') {
    return (
      <FeedbackStateContainer
        as={as}
        size={size}
        titleId={titleId}
        role={resolvedRole}
        applySizePadding={false}
        align="start"
        className={cn(
          VARIANT_CLASSES.banner[tone],
          'p-inset-md gap-stack-md',
          className,
        )}
        {...props}
      >
        <div className="gap-stack-md flex flex-col justify-between sm:flex-row sm:items-center">
          <div className="gap-stack-sm flex min-w-0 flex-1 items-start">
            {effectiveIcon !== null ? (
              <FeedbackMedallion
                icon={effectiveIcon}
                size="sm"
                toneClassName={TONE_MEDALLION_CLASSES[tone]}
              />
            ) : null}

            <FeedbackTextBlock
              title={effectiveTitle}
              titleId={titleId}
              headingAs={headingAs}
              description={effectiveDescription}
              size={size}
              badge={badge}
              className="max-w-none flex-1"
            />
          </div>

          <FeedbackActionsGroup
            action={resolvedAction}
            secondaryAction={secondaryAction}
            actions={actions}
            size="sm"
            align="start"
            className="shrink-0"
          />
        </div>

        {children ? <div className="w-full">{children}</div> : null}
      </FeedbackStateContainer>
    )
  }

  return (
    <FeedbackStateContainer
      as={as}
      size={size}
      titleId={titleId}
      role={resolvedRole}
      className={cn(VARIANT_CLASSES[variant][tone], className)}
      {...props}
    >
      {effectiveIcon !== null ? (
        <FeedbackMedallion
          icon={effectiveIcon}
          size={size}
          toneClassName={TONE_MEDALLION_CLASSES[tone]}
        />
      ) : null}

      <FeedbackTextBlock
        title={effectiveTitle}
        titleId={titleId}
        headingAs={headingAs}
        description={effectiveDescription}
        size={size}
        badge={badge}
      />

      {children ? <div className="w-full max-w-md">{children}</div> : null}

      <FeedbackActionsGroup
        action={resolvedAction}
        secondaryAction={secondaryAction}
        actions={actions}
        size={size}
      />
    </FeedbackStateContainer>
  )
}
