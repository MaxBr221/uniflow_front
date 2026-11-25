import type { HTMLAttributes, ReactNode } from 'react'
import {
  DialogSurface,
  type DialogSurfaceRole,
} from '@/components/DialogSurface.tsx'
import { cn } from '@/utils/cn.ts'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
export type ModalRole = DialogSurfaceRole

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
}

export interface ModalProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'role' | 'children'
> {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  ariaLabel?: string
  children?: ReactNode
  footer?: ReactNode
  size?: ModalSize
  role?: ModalRole
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  closeLabel?: string
  initialFocusRef?: { readonly current: HTMLElement | null }
  portalTarget?: Element | DocumentFragment
  bodyClassName?: string
  overlayClassName?: string
}

export function Modal({
  size = 'md',
  closeLabel = 'Fechar modal',
  overlayClassName,
  className,
  ...props
}: ModalProps) {
  return (
    <DialogSurface
      closeLabel={closeLabel}
      overlayClassName={cn(
        'p-inset-xs sm:p-inset-lg items-end justify-center sm:items-center',
        overlayClassName,
      )}
      panelClassName={cn(
        'max-h-[calc(100svh-1rem)] rounded-2xl border shadow-xl sm:max-h-[calc(100svh-3rem)]',
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  )
}
