import type { LucideIcon } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'
import type { LinkProps } from 'react-router'
import { AppIcon, type AppIconSize } from '@/components/AppIcon.tsx'
import {
  Button,
  ButtonLink,
  type ButtonSize,
  type ButtonVariant,
} from '@/components/Button.tsx'
import { TYPOGRAPHY_CLASSES } from '@/styles/typography.ts'
import { cn } from '@/utils/cn.ts'

export type FeedbackSize = 'sm' | 'md' | 'lg'
export type FeedbackAs = 'div' | 'section'
export type FeedbackHeadingAs = 'h2' | 'h3' | 'h4'
export type FeedbackAlign = 'center' | 'start'

interface FeedbackActionBase {
  label: string
  icon?: LucideIcon
  variant?: ButtonVariant
  disabled?: boolean
}

export interface FeedbackButtonAction extends FeedbackActionBase {
  onClick: () => void
  to?: never
  isLoading?: boolean
  loadingText?: string
}

export interface FeedbackLinkAction extends FeedbackActionBase {
  to: LinkProps['to']
  onClick?: never
}

export type FeedbackAction = FeedbackButtonAction | FeedbackLinkAction

const SIZE_PADDING_CLASSES: Record<FeedbackSize, string> = {
  sm: 'p-inset-md sm:p-inset-lg gap-stack-sm',
  md: 'p-inset-lg sm:p-inset-xl gap-stack-md',
  lg: 'px-inset-lg py-10 sm:px-inset-xl sm:py-12 gap-stack-md',
}

const MEDALLION_SIZE_CLASSES: Record<FeedbackSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
}

const ICON_SIZE_BY_FEEDBACK: Record<FeedbackSize, AppIconSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

const BUTTON_SIZE_BY_FEEDBACK: Record<FeedbackSize, ButtonSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

const HEADING_CLASS_BY_SIZE: Record<FeedbackSize, string> = {
  sm: TYPOGRAPHY_CLASSES.label,
  md: TYPOGRAPHY_CLASSES.headingSm,
  lg: TYPOGRAPHY_CLASSES.headingMd,
}

const DESCRIPTION_CLASS_BY_SIZE: Record<FeedbackSize, string> = {
  sm: TYPOGRAPHY_CLASSES.bodySm,
  md: TYPOGRAPHY_CLASSES.bodySm,
  lg: TYPOGRAPHY_CLASSES.body,
}

export interface FeedbackActionButtonProps {
  action: FeedbackAction
  defaultVariant: ButtonVariant
  buttonSize: ButtonSize
}

export function FeedbackActionButton({
  action,
  defaultVariant,
  buttonSize,
}: FeedbackActionButtonProps) {
  const variant = action.variant ?? defaultVariant

  if (action.to !== undefined) {
    return (
      <ButtonLink
        to={action.to}
        variant={variant}
        size={buttonSize}
        leftIcon={action.icon}
        aria-disabled={action.disabled || undefined}
        className="w-full sm:w-auto"
      >
        {action.label}
      </ButtonLink>
    )
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={buttonSize}
      leftIcon={action.icon}
      disabled={action.disabled}
      isLoading={action.isLoading}
      loadingText={action.loadingText}
      onClick={action.onClick}
      className="w-full sm:w-auto"
    >
      {action.label}
    </Button>
  )
}

export interface FeedbackMedallionProps {
  icon: LucideIcon
  size: FeedbackSize
  toneClassName: string
  className?: string
}

export function FeedbackMedallion({
  icon,
  size,
  toneClassName,
  className,
}: FeedbackMedallionProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-2xl border',
        MEDALLION_SIZE_CLASSES[size],
        toneClassName,
        className,
      )}
    >
      <AppIcon icon={icon} size={ICON_SIZE_BY_FEEDBACK[size]} />
    </span>
  )
}

export interface FeedbackTextBlockProps {
  title: ReactNode
  titleId: string
  headingAs?: FeedbackHeadingAs
  description?: ReactNode
  size: FeedbackSize
  badge?: ReactNode
  className?: string
}

export function FeedbackTextBlock({
  title,
  titleId,
  headingAs: Heading = 'h3',
  description,
  size,
  badge,
  className,
}: FeedbackTextBlockProps) {
  return (
    <div className={cn('space-y-stack-xs max-w-md', className)}>
      {badge ? <div>{badge}</div> : null}
      <Heading id={titleId} className={HEADING_CLASS_BY_SIZE[size]}>
        {title}
      </Heading>
      {description ? (
        <p className={DESCRIPTION_CLASS_BY_SIZE[size]}>{description}</p>
      ) : null}
    </div>
  )
}

export interface FeedbackActionsGroupProps {
  action?: FeedbackAction
  secondaryAction?: FeedbackAction
  actions?: ReactNode
  size: FeedbackSize
  align?: FeedbackAlign
  className?: string
}

export function FeedbackActionsGroup({
  action,
  secondaryAction,
  actions,
  size,
  align = 'center',
  className,
}: FeedbackActionsGroupProps) {
  if (!action && !secondaryAction && !actions) {
    return null
  }

  const buttonSize = BUTTON_SIZE_BY_FEEDBACK[size]

  return (
    <div
      className={cn(
        'gap-stack-sm flex w-full flex-col sm:w-auto sm:flex-row',
        align === 'center'
          ? 'items-center justify-center'
          : 'items-stretch sm:items-center',
        className,
      )}
    >
      {actions ? (
        actions
      ) : (
        <>
          {secondaryAction ? (
            <FeedbackActionButton
              action={secondaryAction}
              defaultVariant="outline"
              buttonSize={buttonSize}
            />
          ) : null}
          {action ? (
            <FeedbackActionButton
              action={action}
              defaultVariant="primary"
              buttonSize={buttonSize}
            />
          ) : null}
        </>
      )}
    </div>
  )
}

export interface FeedbackStateContainerProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  as?: FeedbackAs
  size: FeedbackSize
  titleId: string
  applySizePadding?: boolean
  align?: FeedbackAlign
}

export function FeedbackStateContainer({
  as: Container = 'div',
  size,
  titleId,
  applySizePadding = true,
  align = 'center',
  className,
  children,
  'aria-labelledby': externalAriaLabelledBy,
  'aria-label': externalAriaLabel,
  ...props
}: FeedbackStateContainerProps) {
  return (
    <Container
      aria-label={externalAriaLabel}
      aria-labelledby={
        externalAriaLabel
          ? undefined
          : (externalAriaLabelledBy ??
            (Container === 'section' ? titleId : undefined))
      }
      className={cn(
        'flex w-full flex-col',
        align === 'center'
          ? 'items-center justify-center text-center'
          : 'items-stretch text-left',
        applySizePadding && SIZE_PADDING_CLASSES[size],
        className,
      )}
      {...props}
    >
      {children}
    </Container>
  )
}
