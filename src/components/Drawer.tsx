import type { HTMLAttributes, ReactNode } from 'react'
import {
  DialogSurface,
  type DialogSurfaceRole,
} from '@/components/DialogSurface.tsx'
import { cn } from '@/utils/cn.ts'

export type DrawerPlacement = 'left' | 'right' | 'bottom'
export type DrawerSize = 'sm' | 'md' | 'lg'
export type DrawerRole = DialogSurfaceRole

const OVERLAY_ALIGNMENT_CLASSES: Record<DrawerPlacement, string> = {
  left: 'items-stretch justify-start',
  right: 'items-stretch justify-end',
  bottom: 'items-end justify-center pt-inset-lg',
}

const HORIZONTAL_SIZE_CLASSES: Record<DrawerSize, string> = {
  sm: 'max-w-[min(85vw,18rem)] sm:max-w-xs',
  md: 'max-w-[min(85vw,22rem)] sm:max-w-sm',
  lg: 'max-w-[min(92vw,28rem)] sm:max-w-md',
}

const BOTTOM_SIZE_CLASSES: Record<DrawerSize, string> = {
  sm: 'max-h-[60svh] sm:max-w-lg',
  md: 'max-h-[80svh] sm:max-w-2xl',
  lg: 'max-h-[92svh] sm:max-w-4xl',
}

function getDrawerPanelClassName(
  placement: DrawerPlacement,
  size: DrawerSize,
): string {
  if (placement === 'left') {
    return cn(
      'h-full max-h-dvh border-r shadow-2xl rounded-none sm:rounded-r-2xl',
      HORIZONTAL_SIZE_CLASSES[size],
    )
  }

  if (placement === 'right') {
    return cn(
      'h-full max-h-dvh border-l shadow-2xl rounded-none sm:rounded-l-2xl',
      HORIZONTAL_SIZE_CLASSES[size],
    )
  }

  return cn('rounded-t-2xl border-t shadow-2xl', BOTTOM_SIZE_CLASSES[size])
}

export interface DrawerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'role' | 'children'
> {
  isOpen: boolean
  onClose: () => void
  placement?: DrawerPlacement
  size?: DrawerSize
  role?: DrawerRole
  title?: ReactNode
  description?: ReactNode
  ariaLabel?: string
  children?: ReactNode
  footer?: ReactNode
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  closeLabel?: string
  initialFocusRef?: { readonly current: HTMLElement | null }
  portalTarget?: Element | DocumentFragment
  bodyClassName?: string
  overlayClassName?: string
}

export function Drawer({
  placement = 'right',
  size = 'md',
  closeLabel = 'Fechar painel',
  overlayClassName,
  className,
  ...props
}: DrawerProps) {
  return (
    <DialogSurface
      closeLabel={closeLabel}
      overlayClassName={cn(
        OVERLAY_ALIGNMENT_CLASSES[placement],
        overlayClassName,
      )}
      panelClassName={cn(getDrawerPanelClassName(placement, size), className)}
      {...props}
    />
  )
}
