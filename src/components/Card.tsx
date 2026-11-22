import { useId, type HTMLAttributes, type ReactNode, type Ref } from 'react'
import { SPACING_CLASSES } from '@/styles/spacing.ts'
import { TYPOGRAPHY_CLASSES } from '@/styles/typography.ts'
import { cn } from '@/utils/cn.ts'

export type CardTone =
  'default' | 'subtle' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

export type CardPadding = 'none' | 'compact' | 'default'
export type CardElevation = 'none' | 'sm' | 'md'
export type CardAs = 'div' | 'section' | 'article' | 'aside'
export type CardTitleAs = 'h1' | 'h2' | 'h3' | 'h4'

const TONE_CLASSES: Record<CardTone, string> = {
  default: 'bg-surface-card border-border-subtle',
  subtle: 'bg-surface-subtle border-border-subtle',
  brand: 'bg-brand-50/70 border-brand-200',
  success: 'bg-success-50/70 border-success-200',
  warning: 'bg-warning-50/70 border-warning-200',
  danger: 'bg-danger-50/70 border-danger-200',
  info: 'bg-info-50/70 border-info-200',
}

const INTERACTIVE_TONE_CLASSES: Record<CardTone, string> = {
  default: 'hover:border-border-strong hover:shadow-sm',
  subtle:
    'hover:border-border-strong hover:bg-surface-muted/50 hover:shadow-sm',
  brand: 'hover:border-brand-300 hover:shadow-sm',
  success: 'hover:border-success-600/40 hover:shadow-sm',
  warning: 'hover:border-warning-600/40 hover:shadow-sm',
  danger: 'hover:border-danger-600/40 hover:shadow-sm',
  info: 'hover:border-info-600/40 hover:shadow-sm',
}

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: '',
  compact: SPACING_CLASSES.cardPaddingCompact,
  default: SPACING_CLASSES.cardPadding,
}

const ELEVATION_CLASSES: Record<CardElevation, string> = {
  none: 'shadow-none',
  sm: 'shadow-xs',
  md: 'shadow-sm',
}

function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== ''
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode
  bordered?: boolean
  ref?: Ref<HTMLDivElement>
}

export function CardHeader({
  action,
  bordered = false,
  className,
  children,
  ref,
  ...props
}: CardHeaderProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'gap-stack-md flex items-start justify-between',
        bordered && 'border-border-subtle pb-stack-md border-b',
        className,
      )}
      {...props}
    >
      <div className="space-y-stack-xs min-w-0 flex-1">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: CardTitleAs
  ref?: Ref<HTMLHeadingElement>
}

export function CardTitle({
  as: Component = 'h3',
  className,
  children,
  ref,
  ...props
}: CardTitleProps) {
  return (
    <Component
      ref={ref}
      className={cn(TYPOGRAPHY_CLASSES.headingSm, className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>
}

export function CardDescription({
  className,
  children,
  ref,
  ...props
}: CardDescriptionProps) {
  return (
    <p
      ref={ref}
      className={cn(TYPOGRAPHY_CLASSES.bodySm, className)}
      {...props}
    >
      {children}
    </p>
  )
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
}

export function CardContent({
  className,
  children,
  ref,
  ...props
}: CardContentProps) {
  return (
    <div ref={ref} className={cn('min-w-0 flex-1', className)} {...props}>
      {children}
    </div>
  )
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
  ref?: Ref<HTMLDivElement>
}

export function CardFooter({
  bordered = false,
  className,
  children,
  ref,
  ...props
}: CardFooterProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'gap-stack-sm flex flex-wrap items-center justify-between',
        bordered && 'border-border-subtle pt-stack-md border-t',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  as?: CardAs
  tone?: CardTone
  padding?: CardPadding
  elevation?: CardElevation
  interactive?: boolean
  divided?: boolean
  title?: ReactNode
  titleAs?: CardTitleAs
  titleId?: string
  description?: ReactNode
  headerAction?: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
}

export function Card({
  as: Component = 'div',
  tone = 'default',
  padding = 'default',
  elevation = 'sm',
  interactive = false,
  divided = false,
  title,
  titleAs = 'h3',
  titleId,
  description,
  headerAction,
  footer,
  className,
  contentClassName,
  children,
  'aria-labelledby': externalAriaLabelledBy,
  'aria-label': externalAriaLabel,
  ...props
}: CardProps) {
  const generatedTitleId = useId()
  const hasTitle = hasContent(title)
  const hasDescription = hasContent(description)
  const hasHeader = hasTitle || hasDescription || hasContent(headerAction)
  const hasBody = hasContent(children)
  const hasFooter = hasContent(footer)
  const resolvedTitleId = hasTitle ? (titleId ?? generatedTitleId) : undefined

  const useStructuredSlots = hasHeader || hasFooter

  return (
    <Component
      aria-label={externalAriaLabel}
      aria-labelledby={
        externalAriaLabelledBy ??
        (!externalAriaLabel && resolvedTitleId ? resolvedTitleId : undefined)
      }
      className={cn(
        'text-ink-primary gap-stack-md flex flex-col rounded-2xl border transition-[border-color,box-shadow,background-color]',
        TONE_CLASSES[tone],
        PADDING_CLASSES[padding],
        ELEVATION_CLASSES[elevation],
        interactive && INTERACTIVE_TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {hasHeader ? (
        <CardHeader action={headerAction} bordered={divided}>
          {hasTitle ? (
            <CardTitle as={titleAs} id={resolvedTitleId}>
              {title}
            </CardTitle>
          ) : null}
          {hasDescription ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
      ) : null}

      {useStructuredSlots ? (
        hasBody ? (
          <CardContent className={contentClassName}>{children}</CardContent>
        ) : null
      ) : (
        children
      )}

      {hasFooter ? <CardFooter bordered={divided}>{footer}</CardFooter> : null}
    </Component>
  )
}
