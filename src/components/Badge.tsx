import type { LucideIcon } from 'lucide-react'
import type { HTMLAttributes, ReactNode, Ref } from 'react'
import { AppIcon } from '@/components/AppIcon.tsx'
import { cn } from '@/utils/cn.ts'

export type BadgeTone =
  'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

export type BadgeAppearance = 'soft' | 'outline' | 'solid'
export type BadgeSize = 'sm' | 'md' | 'lg'

const APPEARANCE_TONE_CLASSES: Record<
  BadgeAppearance,
  Record<BadgeTone, string>
> = {
  soft: {
    neutral: 'bg-surface-subtle text-ink-secondary border-border-subtle',
    brand: 'bg-brand-100 text-brand-700 border-brand-200',
    success: 'bg-success-100 text-success-700 border-success-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    danger: 'bg-danger-100 text-danger-700 border-danger-200',
    info: 'bg-info-100 text-info-700 border-info-200',
  },
  outline: {
    neutral: 'bg-surface-card text-ink-secondary border-border-default',
    brand: 'bg-surface-card text-brand-700 border-brand-200',
    success: 'bg-surface-card text-success-700 border-success-200',
    warning: 'bg-surface-card text-warning-700 border-warning-200',
    danger: 'bg-surface-card text-danger-700 border-danger-200',
    info: 'bg-surface-card text-info-700 border-info-200',
  },
  solid: {
    neutral: 'bg-ink-primary text-ink-inverse border-transparent',
    brand: 'bg-brand-600 text-ink-inverse border-transparent',
    success: 'bg-success-600 text-ink-inverse border-transparent',
    warning: 'bg-warning-600 text-ink-inverse border-transparent',
    danger: 'bg-danger-600 text-ink-inverse border-transparent',
    info: 'bg-info-600 text-ink-inverse border-transparent',
  },
}

const DOT_TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-ink-muted',
  brand: 'bg-brand-600',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  danger: 'bg-danger-600',
  info: 'bg-info-600',
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-caption gap-1',
  md: 'px-2.5 py-1 text-caption gap-1.5',
  lg: 'px-3 py-1 text-body-sm gap-1.5',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  appearance?: BadgeAppearance
  size?: BadgeSize
  dot?: boolean
  uppercase?: boolean
  mono?: boolean
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  children: ReactNode
  ref?: Ref<HTMLSpanElement>
}

export function Badge({
  tone = 'neutral',
  appearance = 'soft',
  size = 'md',
  dot = false,
  uppercase = false,
  mono = false,
  leftIcon,
  rightIcon,
  className,
  children,
  ref,
  ...props
}: BadgeProps) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex max-w-full shrink-0 items-center justify-center rounded-full border leading-none font-semibold whitespace-nowrap tabular-nums',
        APPEARANCE_TONE_CLASSES[appearance][tone],
        SIZE_CLASSES[size],
        uppercase && 'tracking-wider uppercase',
        mono && 'font-mono',
        className,
      )}
      {...props}
    >
      {dot && !leftIcon ? (
        <span
          aria-hidden="true"
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            appearance === 'solid' ? 'bg-ink-inverse' : DOT_TONE_CLASSES[tone],
          )}
        />
      ) : null}
      {leftIcon ? (
        <AppIcon icon={leftIcon} size="xs" className="shrink-0" />
      ) : null}
      <span className="truncate">{children}</span>
      {rightIcon ? (
        <AppIcon icon={rightIcon} size="xs" className="shrink-0" />
      ) : null}
    </span>
  )
}
