import { cn } from '@/utils/cn.ts'

export type FormControlSize = 'sm' | 'md' | 'lg'

export const FORM_CONTROL_SIZE_CLASSES: Record<FormControlSize, string> = {
  sm: 'h-9 text-body-sm rounded-lg',
  md: 'h-10 text-body-sm rounded-xl',
  lg: 'h-11 text-body rounded-xl',
}

export const FORM_CONTROL_TEXTAREA_SIZE_CLASSES: Record<
  FormControlSize,
  string
> = {
  sm: 'min-h-20 py-inset-xs text-body-sm rounded-lg',
  md: 'min-h-24 py-inset-sm text-body-sm rounded-xl',
  lg: 'min-h-28 py-inset-sm text-body rounded-xl',
}

export const FORM_CONTROL_HORIZONTAL_PADDING: Record<FormControlSize, string> =
  {
    sm: 'px-inset-sm',
    md: 'px-inset-md',
    lg: 'px-inset-md',
  }

export function getFormControlClassName({
  size = 'md',
  hasError = false,
  multiline = false,
  className,
}: {
  size?: FormControlSize
  hasError?: boolean
  multiline?: boolean
  className?: string
}): string {
  return cn(
    'w-full border bg-surface-card text-ink-primary placeholder:text-ink-muted transition-colors',
    'focus:outline-none focus:ring-2',
    'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-ink-muted',
    multiline
      ? FORM_CONTROL_TEXTAREA_SIZE_CLASSES[size]
      : FORM_CONTROL_SIZE_CLASSES[size],
    hasError
      ? 'border-danger-600 focus:border-danger-600 focus:ring-danger-600/15'
      : 'border-border-default hover:border-border-strong focus:border-border-focus focus:ring-brand-600/15',
    className,
  )
}
