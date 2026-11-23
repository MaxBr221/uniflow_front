import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { FocusEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AppIcon } from '@/components/AppIcon.tsx'
import { Button } from '@/components/Button.tsx'
import { useToast } from '@/hooks/useToast.ts'
import {
  DEFAULT_MAX_VISIBLE_TOASTS,
  toastStore,
  type ToastItem,
  type ToastPosition,
  type ToastVariant,
} from '@/lib/toast.ts'
import { TYPOGRAPHY_CLASSES } from '@/styles/typography.ts'
import { cn } from '@/utils/cn.ts'

export type {
  ToastAction,
  ToastItem,
  ToastOptions,
  ToastPosition,
  ToastVariant,
} from '@/lib/toast.ts'

interface ToastVisualConfig {
  icon: LucideIcon
  containerClass: string
  iconWrapperClass: string
}

const VARIANT_CONFIG: Record<ToastVariant, ToastVisualConfig> = {
  info: {
    icon: Info,
    containerClass: 'border-info-200',
    iconWrapperClass: 'bg-info-100 text-info-700',
  },
  success: {
    icon: CheckCircle2,
    containerClass: 'border-success-200',
    iconWrapperClass: 'bg-success-100 text-success-700',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'border-warning-200',
    iconWrapperClass: 'bg-warning-100 text-warning-700',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'border-danger-200',
    iconWrapperClass: 'bg-danger-100 text-danger-700',
  },
}

const POSITION_CLASSES: Record<ToastPosition, string> = {
  'top-right':
    'inset-x-inset-sm top-inset-sm sm:left-auto sm:right-inset-lg sm:top-inset-lg sm:w-full sm:max-w-sm',
  'top-center':
    'inset-x-inset-sm top-inset-sm sm:left-1/2 sm:right-auto sm:top-inset-lg sm:w-full sm:max-w-md sm:-translate-x-1/2',
  'bottom-right':
    'inset-x-inset-sm bottom-inset-sm sm:left-auto sm:right-inset-lg sm:bottom-inset-lg sm:w-full sm:max-w-sm',
  'bottom-center':
    'inset-x-inset-sm bottom-inset-sm sm:left-1/2 sm:right-auto sm:bottom-inset-lg sm:w-full sm:max-w-md sm:-translate-x-1/2',
}

export interface ToastProps {
  toast: ToastItem
  onDismiss: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  closeLabel?: string
  className?: string
}

export function Toast({
  toast,
  onDismiss,
  onPause,
  onResume,
  closeLabel = 'Fechar notificação',
  className,
}: ToastProps) {
  const visual = VARIANT_CONFIG[toast.variant]
  const isError = toast.variant === 'error'

  function handleBlur(event: FocusEvent<HTMLDivElement>): void {
    const nextFocused = event.relatedTarget
    if (
      nextFocused instanceof Node &&
      event.currentTarget.contains(nextFocused)
    ) {
      return
    }
    onResume?.(toast.id)
  }

  function handleActionClick(): void {
    toast.action?.onClick()
    onDismiss(toast.id)
  }

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={() => onPause?.(toast.id)}
      onMouseLeave={() => onResume?.(toast.id)}
      onFocus={() => onPause?.(toast.id)}
      onBlur={handleBlur}
      className={cn(
        'bg-surface-card text-ink-primary gap-stack-sm p-inset-md pointer-events-auto flex w-full items-start rounded-2xl border shadow-lg',
        visual.containerClass,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
          visual.iconWrapperClass,
        )}
      >
        <AppIcon icon={visual.icon} size="sm" />
      </span>

      <div className="space-y-stack-xs min-w-0 flex-1">
        <p className={cn(TYPOGRAPHY_CLASSES.label, 'leading-snug')}>
          {toast.title}
        </p>
        {toast.description ? (
          <p className={TYPOGRAPHY_CLASSES.bodySm}>{toast.description}</p>
        ) : null}
        {toast.action ? (
          <div className="pt-stack-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleActionClick}
            >
              {toast.action.label}
            </Button>
          </div>
        ) : null}
      </div>

      {toast.dismissible ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDismiss(toast.id)}
          aria-label={closeLabel}
          className="-mt-1 -mr-1 h-8 w-8 shrink-0 rounded-lg"
        >
          <AppIcon icon={X} size="xs" />
        </Button>
      ) : null}
    </div>
  )
}

export interface ToastViewportProps {
  position?: ToastPosition
  maxVisible?: number
  closeLabel?: string
  portalTarget?: Element | DocumentFragment
  className?: string
}

export function ToastViewport({
  position = 'top-right',
  maxVisible = DEFAULT_MAX_VISIBLE_TOASTS,
  closeLabel,
  portalTarget,
  className,
}: ToastViewportProps) {
  const { toasts, dismiss } = useToast()

  if (typeof document === 'undefined') {
    return null
  }

  const visibleToasts =
    maxVisible > 0 ? toasts.slice(-maxVisible) : toasts.slice(0, 0)

  return createPortal(
    <div
      role="region"
      aria-label="Notificações"
      className={cn(
        'gap-stack-sm pointer-events-none fixed z-60 flex flex-col',
        POSITION_CLASSES[position],
        className,
      )}
    >
      {visibleToasts.map((item) => (
        <Toast
          key={item.id}
          toast={item}
          onDismiss={dismiss}
          onPause={toastStore.pause}
          onResume={toastStore.resume}
          closeLabel={closeLabel}
        />
      ))}
    </div>,
    portalTarget ?? document.body,
  )
}

export interface ToastProviderProps extends ToastViewportProps {
  children: ReactNode
}

export function ToastProvider({
  children,
  ...viewportProps
}: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastViewport {...viewportProps} />
    </>
  )
}
