import { Loader2 } from 'lucide-react'
import type { HTMLAttributes, Ref } from 'react'
import { AppIcon, type AppIconSize } from '@/components/AppIcon.tsx'
import { BrandLogo } from '@/components/BrandLogo.tsx'
import { TYPOGRAPHY_CLASSES } from '@/styles/typography.ts'
import { cn } from '@/utils/cn.ts'

export type LoadingVariant = 'inline' | 'block' | 'fullscreen' | 'overlay'
export type LoadingSize = 'sm' | 'md' | 'lg'
export type LoadingTone = 'brand' | 'neutral' | 'inverse'
export type SkeletonShape = 'text' | 'rect' | 'circle'

const ICON_SIZE_BY_LOADING: Record<LoadingSize, AppIconSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

const MEDALLION_SIZE_CLASSES: Record<LoadingSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
}

const VARIANT_CONTAINER_CLASSES: Record<LoadingVariant, string> = {
  inline: 'inline-flex items-center gap-stack-sm',
  block:
    'flex w-full flex-col items-center justify-center gap-stack-sm p-inset-lg sm:p-inset-xl text-center',
  fullscreen:
    'flex min-h-svh w-full flex-col items-center justify-center gap-stack-md bg-surface-canvas p-inset-md sm:p-inset-lg text-center',
  overlay:
    'absolute inset-0 z-30 flex flex-col items-center justify-center gap-stack-sm rounded-[inherit] bg-surface-card/80 p-inset-md text-center backdrop-blur-[2px]',
}

const TONE_SPINNER_CLASSES: Record<LoadingTone, string> = {
  brand: 'text-brand-600',
  neutral: 'text-ink-secondary',
  inverse: 'text-ink-inverse',
}

const TONE_MEDALLION_CLASSES: Record<LoadingTone, string> = {
  brand: 'bg-brand-50 border-brand-100',
  neutral: 'bg-surface-subtle border-border-subtle',
  inverse: 'bg-ink-inverse/15 border-ink-inverse/25',
}

const TONE_LABEL_CLASSES: Record<LoadingTone, string> = {
  brand: 'text-ink-primary',
  neutral: 'text-ink-primary',
  inverse: 'text-ink-inverse',
}

const TONE_DESCRIPTION_CLASSES: Record<LoadingTone, string> = {
  brand: 'text-ink-secondary',
  neutral: 'text-ink-secondary',
  inverse: 'text-ink-inverse/80',
}

const SKELETON_SHAPE_CLASSES: Record<SkeletonShape, string> = {
  text: 'h-4 w-full rounded-md',
  rect: 'h-24 w-full rounded-xl',
  circle: 'h-10 w-10 shrink-0 rounded-full',
}

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  variant?: LoadingVariant
  size?: LoadingSize
  tone?: LoadingTone
  label?: string
  description?: string
  ariaLabel?: string
  showBrand?: boolean
  ref?: Ref<HTMLDivElement>
}

export function Loading({
  variant = 'block',
  size = 'md',
  tone = 'brand',
  label,
  description,
  ariaLabel = 'Carregando...',
  showBrand = false,
  className,
  ref,
  ...props
}: LoadingProps) {
  const isInline = variant === 'inline'
  const resolvedLabel =
    label !== undefined ? label : isInline ? undefined : 'Carregando...'
  const hasVisibleLabel = Boolean(resolvedLabel)
  const shouldShowBrand =
    showBrand && (variant === 'fullscreen' || variant === 'block')

  const spinner = (
    <AppIcon
      icon={Loader2}
      size={ICON_SIZE_BY_LOADING[size]}
      className={cn('shrink-0 animate-spin', TONE_SPINNER_CLASSES[tone])}
    />
  )

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(VARIANT_CONTAINER_CLASSES[variant], className)}
      {...props}
    >
      {shouldShowBrand ? <BrandLogo size="sm" /> : null}

      {isInline ? (
        spinner
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-2xl border',
            MEDALLION_SIZE_CLASSES[size],
            TONE_MEDALLION_CLASSES[tone],
          )}
        >
          {spinner}
        </span>
      )}

      {hasVisibleLabel ? (
        isInline ? (
          <span
            className={cn(TYPOGRAPHY_CLASSES.bodySm, TONE_LABEL_CLASSES[tone])}
          >
            {resolvedLabel}
          </span>
        ) : (
          <div className="space-y-stack-xs max-w-sm">
            <p
              className={cn(TYPOGRAPHY_CLASSES.label, TONE_LABEL_CLASSES[tone])}
            >
              {resolvedLabel}
            </p>
            {description ? (
              <p
                className={cn(
                  TYPOGRAPHY_CLASSES.bodySm,
                  TONE_DESCRIPTION_CLASSES[tone],
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        )
      ) : (
        <span className="sr-only">{ariaLabel}</span>
      )}

      {!hasVisibleLabel && !isInline && description ? (
        <p
          className={cn(
            TYPOGRAPHY_CLASSES.bodySm,
            TONE_DESCRIPTION_CLASSES[tone],
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape
  lines?: number
  label?: string
  ref?: Ref<HTMLDivElement>
}

export function Skeleton({
  shape = 'text',
  lines = 1,
  label,
  className,
  ref,
  ...props
}: SkeletonProps) {
  const lineCount = Math.max(1, Math.floor(lines))
  const hasLabel = Boolean(label)
  const accessibilityProps = hasLabel
    ? {
        role: 'status' as const,
        'aria-live': 'polite' as const,
        'aria-busy': true as const,
      }
    : {
        'aria-hidden': true as const,
      }

  const shimmerBase =
    'bg-surface-muted animate-pulse motion-reduce:animate-none'

  if (shape === 'text' && lineCount > 1) {
    return (
      <div
        ref={ref}
        {...accessibilityProps}
        className={cn('gap-stack-sm flex w-full flex-col', className)}
        {...props}
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={cn(
              shimmerBase,
              SKELETON_SHAPE_CLASSES.text,
              index === lineCount - 1 ? 'w-3/4' : 'w-full',
            )}
          />
        ))}
        {hasLabel ? <span className="sr-only">{label}</span> : null}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      {...accessibilityProps}
      className={cn(shimmerBase, SKELETON_SHAPE_CLASSES[shape], className)}
      {...props}
    >
      {hasLabel ? <span className="sr-only">{label}</span> : null}
    </div>
  )
}
