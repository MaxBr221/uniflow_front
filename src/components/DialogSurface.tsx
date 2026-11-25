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

export type DialogSurfaceRole = 'dialog' | 'alertdialog'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const activeDialogStack: symbol[] = []
let lockedBodyOverflow: string | null = null

function pushActiveDialog(dialogId: symbol): void {
  if (activeDialogStack.length === 0) {
    lockedBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  activeDialogStack.push(dialogId)
}

function removeActiveDialog(dialogId: symbol): void {
  const index = activeDialogStack.lastIndexOf(dialogId)
  if (index !== -1) {
    activeDialogStack.splice(index, 1)
  }
  if (activeDialogStack.length === 0 && lockedBodyOverflow !== null) {
    document.body.style.overflow = lockedBodyOverflow
    lockedBodyOverflow = null
  }
}

function isTopMostDialog(dialogId: symbol): boolean {
  return activeDialogStack[activeDialogStack.length - 1] === dialogId
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

export interface DialogSurfaceProps extends Omit<
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
  role?: DialogSurfaceRole
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  closeLabel: string
  initialFocusRef?: { readonly current: HTMLElement | null }
  portalTarget?: Element | DocumentFragment
  bodyClassName?: string
  overlayClassName?: string
  panelClassName?: string
  headerClassName?: string
  footerClassName?: string
  defaultBodyClassName?: string
  defaultFooterClassName?: string
}

export function DialogSurface({
  isOpen,
  onClose,
  title,
  description,
  ariaLabel,
  children,
  footer,
  role = 'dialog',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  closeLabel,
  initialFocusRef,
  portalTarget,
  className,
  bodyClassName,
  overlayClassName,
  panelClassName,
  headerClassName,
  footerClassName,
  defaultBodyClassName,
  defaultFooterClassName,
  'aria-label': externalAriaLabel,
  ...props
}: DialogSurfaceProps) {
  const generatedId = useId()
  const titleId = `${generatedId}-title`
  const descriptionId = `${generatedId}-description`

  const dialogRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const startedInsideDialogRef = useRef(false)

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

    const dialogId = Symbol('dialog')
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    pushActiveDialog(dialogId)

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
      if (!isTopMostDialog(dialogId)) {
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
      removeActiveDialog(dialogId)
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
    startedInsideDialogRef.current = event.target !== event.currentTarget
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>): void {
    const startedInside = startedInsideDialogRef.current
    startedInsideDialogRef.current = false

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
        'bg-ink-primary/45 fixed inset-0 z-50 flex backdrop-blur-[2px]',
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
          'bg-surface-card border-border-subtle text-ink-primary flex w-full flex-col overflow-hidden focus:outline-none',
          panelClassName,
          className,
        )}
        {...props}
      >
        {hasHeader ? (
          <div
            className={cn(
              'border-border-subtle gap-stack-md px-inset-md py-inset-md sm:px-inset-lg flex items-start justify-between border-b',
              headerClassName,
            )}
          >
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
              defaultBodyClassName ??
                'px-inset-md py-inset-md sm:px-inset-lg sm:py-inset-lg min-h-0 flex-1 overflow-y-auto',
              bodyClassName,
            )}
          >
            {children}
          </div>
        ) : null}

        {hasFooter ? (
          <div
            className={cn(
              defaultFooterClassName ??
                'border-border-subtle gap-stack-sm px-inset-md py-inset-md sm:px-inset-lg flex flex-col-reverse border-t sm:flex-row sm:items-center sm:justify-end',
              footerClassName,
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    portalTarget ?? document.body,
  )
}
