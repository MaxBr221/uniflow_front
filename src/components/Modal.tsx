import { X } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AppIcon } from '@/components/AppIcon.tsx'
import { Button } from '@/components/Button.tsx'
import { TYPOGRAPHY_CLASSES } from '@/styles/typography.ts'
import { cn } from '@/utils/cn.ts'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
export type ModalRole = 'dialog' | 'alertdialog'

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const activeModalStack: symbol[] = []
let lockedBodyOverflow: string | null = null

function pushActiveModal(modalId: symbol): void {
  if (activeModalStack.length === 0) {
    lockedBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  activeModalStack.push(modalId)
}

function removeActiveModal(modalId: symbol): void {
  const index = activeModalStack.lastIndexOf(modalId)
  if (index !== -1) {
    activeModalStack.splice(index, 1)
  }
  if (activeModalStack.length === 0 && lockedBodyOverflow !== null) {
    document.body.style.overflow = lockedBodyOverflow
    lockedBodyOverflow = null
  }
}

function isTopMostModal(modalId: symbol): boolean {
  return activeModalStack[activeModalStack.length - 1] === modalId
}

function isFocusableElement(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled')) {
    return false
  }
  if (element.getAttribute('aria-hidden') === 'true') {
    return false
  }
  if (element.closest('[hidden], [aria-hidden="true"], [inert]')) {
    return false
  }
  return element.tabIndex >= 0
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isFocusableElement)
}

function hasRenderableContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== ''
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
  isOpen,
  onClose,
  title,
  description,
  ariaLabel,
  children,
  footer,
  size = 'md',
  role = 'dialog',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  closeLabel = 'Fechar modal',
  initialFocusRef,
  portalTarget,
  className,
  bodyClassName,
  overlayClassName,
  'aria-label': externalAriaLabel,
  ...props
}: ModalProps) {
  const generatedId = useId()
  const titleId = `${generatedId}-title`
  const descriptionId = `${generatedId}-description`

  const dialogRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const startedInsideModalRef = useRef(false)

  const onCloseRef = useRef(onClose)
  const closeOnEscapeRef = useRef(closeOnEscape)
  const initialFocusElementRef = useRef(initialFocusRef)

  useEffect(() => {
    onCloseRef.current = onClose
    closeOnEscapeRef.current = closeOnEscape
    initialFocusElementRef.current = initialFocusRef
  }, [onClose, closeOnEscape, initialFocusRef])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const modalId = Symbol('modal')
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    pushActiveModal(modalId)

    const dialogNode = dialogRef.current
    if (dialogNode) {
      const explicitTarget = initialFocusElementRef.current?.current
      const firstBodyFocusable = bodyRef.current
        ? getFocusableElements(bodyRef.current)[0]
        : undefined
      const firstDialogFocusable = getFocusableElements(dialogNode)[0]

      const focusTarget =
        explicitTarget && dialogNode.contains(explicitTarget)
          ? explicitTarget
          : (firstBodyFocusable ?? firstDialogFocusable ?? dialogNode)

      focusTarget.focus()
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (!isTopMostModal(modalId)) {
        return
      }

      if (event.key === 'Escape' && closeOnEscapeRef.current) {
        event.stopPropagation()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return
      }

      const focusables = getFocusableElements(dialogRef.current)
      if (focusables.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const firstFocusable = focusables[0]
      const lastFocusable = focusables[focusables.length - 1]
      const activeElement = document.activeElement
      const isInsideDialog =
        activeElement instanceof Node &&
        dialogRef.current.contains(activeElement)

      if (event.shiftKey) {
        if (
          activeElement === firstFocusable ||
          activeElement === dialogRef.current ||
          !isInsideDialog
        ) {
          event.preventDefault()
          lastFocusable.focus()
        }
      } else if (activeElement === lastFocusable || !isInsideDialog) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      removeActiveModal(modalId)
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus()
      }
    }
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') {
    return null
  }

  const hasTitle = hasRenderableContent(title)
  const hasDescription = hasRenderableContent(description)
  const hasHeader = hasTitle || hasDescription || showCloseButton
  const hasBody = hasRenderableContent(children)
  const hasFooter = hasRenderableContent(footer)

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>): void {
    startedInsideModalRef.current = event.target !== event.currentTarget
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>): void {
    const startedInside = startedInsideModalRef.current
    startedInsideModalRef.current = false

    if (
      closeOnOverlayClick &&
      !startedInside &&
      event.target === event.currentTarget
    ) {
      onClose()
    }
  }

  return createPortal(
    <div
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
      className={cn(
        'bg-ink-primary/45 p-inset-xs sm:p-inset-lg fixed inset-0 z-50 flex items-end justify-center backdrop-blur-[2px] sm:items-center',
        overlayClassName,
      )}
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-label={hasTitle ? undefined : (ariaLabel ?? externalAriaLabel)}
        aria-describedby={hasDescription ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'bg-surface-card border-border-subtle text-ink-primary flex max-h-[calc(100svh-1rem)] w-full flex-col overflow-hidden rounded-2xl border shadow-xl focus:outline-none sm:max-h-[calc(100svh-3rem)]',
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {hasHeader ? (
          <div className="border-border-subtle gap-stack-md px-inset-md py-inset-md sm:px-inset-lg flex items-start justify-between border-b">
            <div className="space-y-stack-xs min-w-0 flex-1">
              {hasTitle ? (
                <h2 id={titleId} className={TYPOGRAPHY_CLASSES.headingMd}>
                  {title}
                </h2>
              ) : null}
              {hasDescription ? (
                <p id={descriptionId} className={TYPOGRAPHY_CLASSES.bodySm}>
                  {description}
                </p>
              ) : null}
            </div>
            {showCloseButton ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label={closeLabel}
                className="-my-1 -mr-1 shrink-0"
              >
                <AppIcon icon={X} size="sm" />
              </Button>
            ) : null}
          </div>
        ) : null}

        {hasBody ? (
          <div
            ref={bodyRef}
            className={cn(
              'px-inset-md py-inset-md sm:px-inset-lg sm:py-inset-lg min-h-0 flex-1 overflow-y-auto',
              bodyClassName,
            )}
          >
            {children}
          </div>
        ) : null}

        {hasFooter ? (
          <div className="border-border-subtle gap-stack-sm px-inset-md py-inset-md sm:px-inset-lg flex flex-col-reverse border-t sm:flex-row sm:items-center sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    portalTarget ?? document.body,
  )
}
