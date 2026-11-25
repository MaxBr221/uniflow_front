import { Inbox, type LucideIcon } from 'lucide-react'
import { useId, type HTMLAttributes, type ReactNode } from 'react'
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
import { cn } from '@/utils/cn.ts'

export type EmptyStateVariant = 'card' | 'plain'
export type EmptyStateSize = FeedbackSize
export type EmptyStateTone = 'brand' | 'neutral'
export type EmptyStateAs = FeedbackAs
export type EmptyStateHeadingAs = FeedbackHeadingAs
export type EmptyStateButtonAction = FeedbackButtonAction
export type EmptyStateLinkAction = FeedbackLinkAction
export type EmptyStateAction = FeedbackAction

const VARIANT_CLASSES: Record<EmptyStateVariant, string> = {
  card: 'bg-surface-card border-border-default rounded-2xl border border-dashed shadow-xs',
  plain: 'bg-transparent border-0',
}

const TONE_MEDALLION_CLASSES: Record<EmptyStateTone, string> = {
  brand: 'bg-brand-50 border-brand-100 text-brand-600',
  neutral: 'bg-surface-subtle border-border-subtle text-ink-secondary',
}

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  title: ReactNode
  description?: ReactNode
  icon?: LucideIcon | null
  variant?: EmptyStateVariant
  size?: EmptyStateSize
  tone?: EmptyStateTone
  as?: EmptyStateAs
  headingAs?: EmptyStateHeadingAs
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  actions?: ReactNode
  children?: ReactNode
}

export function EmptyState({
  title,
  description,
  icon = Inbox,
  variant = 'card',
  size = 'md',
  tone = 'brand',
  as = 'div',
  headingAs = 'h3',
  action,
  secondaryAction,
  actions,
  children,
  className,
  ...props
}: EmptyStateProps) {
  const generatedTitleId = useId()
  const titleId = props['aria-labelledby'] ?? generatedTitleId

  return (
    <FeedbackStateContainer
      as={as}
      size={size}
      titleId={titleId}
      className={cn(VARIANT_CLASSES[variant], className)}
      {...props}
    >
      {icon !== null ? (
        <FeedbackMedallion
          icon={icon}
          size={size}
          toneClassName={TONE_MEDALLION_CLASSES[tone]}
        />
      ) : null}

      <FeedbackTextBlock
        title={title}
        titleId={titleId}
        headingAs={headingAs}
        description={description}
        size={size}
      />

      {children ? <div className="w-full max-w-md">{children}</div> : null}

      <FeedbackActionsGroup
        action={action}
        secondaryAction={secondaryAction}
        actions={actions}
        size={size}
      />
    </FeedbackStateContainer>
  )
}
