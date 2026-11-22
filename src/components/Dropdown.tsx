import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Link, type LinkProps } from 'react-router'
import { AppIcon } from '@/components/AppIcon.tsx'
import {
  Button,
  type ButtonSize,
  type ButtonVariant,
} from '@/components/Button.tsx'
import { cn } from '@/utils/cn.ts'

export type DropdownAlign = 'left' | 'right'
export type DropdownSide = 'bottom' | 'top'
export type DropdownItemTone = 'default' | 'danger'

export interface DropdownActionItem {
  id: string
  type?: 'action'
  label: string
  description?: string
  icon?: LucideIcon
  tone?: DropdownItemTone
  disabled?: boolean
  selected?: boolean
  closeOnSelect?: boolean
  onSelect?: () => void
  to?: LinkProps['to']
  href?: string
  target?: string
  rel?: string
}

export interface DropdownSeparatorItem {
  id: string
  type: 'separator'
}

export interface DropdownLabelItem {
  id: string
  type: 'label'
  label: string
}

export type DropdownItem =
  DropdownActionItem | DropdownSeparatorItem | DropdownLabelItem

export interface DropdownTriggerProps {
  id: string
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls'?: string
  onClick: () => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  disabled?: boolean
}

export interface DropdownTriggerRenderContext extends DropdownTriggerProps {
  isOpen: boolean
}

export interface DropdownProps {
  items: readonly DropdownItem[]
  label?: string
  header?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  renderTrigger?: (context: DropdownTriggerRenderContext) => ReactNode
  triggerVariant?: ButtonVariant
  triggerSize?: ButtonSize
  triggerIcon?: LucideIcon
  triggerAriaLabel?: string
  hideChevron?: boolean
  disabled?: boolean
  align?: DropdownAlign
  side?: DropdownSide
  matchTriggerWidth?: boolean
  fullWidth?: boolean
  menuAriaLabel?: string
  className?: string
  triggerClassName?: string
  menuClassName?: string
}

type FocusIntent = 'first' | 'last' | 'none'

const MENU_ORIGIN_CLASSES: Record<
  DropdownSide,
  Record<DropdownAlign, string>
> = {
  bottom: {
    left: 'top-full left-0 mt-stack-xs origin-top-left',
    right: 'top-full right-0 mt-stack-xs origin-top-right',
  },
  top: {
    left: 'bottom-full left-0 mb-stack-xs origin-bottom-left',
    right: 'bottom-full right-0 mb-stack-xs origin-bottom-right',
  },
}

function getEnabledMenuItems(menuElement: HTMLElement | null): HTMLElement[] {
  if (!menuElement) {
    return []
  }
  return Array.from(
    menuElement.querySelectorAll<HTMLElement>('[role="menuitem"]'),
  ).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-disabled') !== 'true',
  )
}

function getMenuItemClassName({
  tone = 'default',
  selected = false,
  disabled = false,
}: {
  tone?: DropdownItemTone
  selected?: boolean
  disabled?: boolean
}): string {
  return cn(
    'flex w-full items-center gap-stack-sm rounded-lg px-inset-sm py-2 text-left text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-border-focus',
    disabled
      ? 'text-ink-muted cursor-not-allowed opacity-55'
      : tone === 'danger'
        ? 'text-danger-600 hover:bg-danger-50 focus-visible:bg-danger-50 cursor-pointer'
        : selected
          ? 'bg-brand-50 text-brand-700 hover:bg-brand-100/70 focus-visible:bg-brand-100/70 cursor-pointer font-medium'
          : 'text-ink-primary hover:bg-surface-subtle focus-visible:bg-surface-subtle cursor-pointer',
  )
}

function DropdownActionContent({ item }: { item: DropdownActionItem }) {
  return (
    <>
      {item.icon ? (
        <AppIcon
          icon={item.icon}
          size="sm"
          className={cn(
            'shrink-0',
            item.disabled
              ? 'text-ink-muted'
              : item.tone === 'danger'
                ? 'text-danger-600'
                : item.selected
                  ? 'text-brand-600'
                  : 'text-ink-secondary',
          )}
        />
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{item.label}</span>
        {item.description ? (
          <span className="text-caption text-ink-muted block truncate font-normal">
            {item.description}
          </span>
        ) : null}
      </span>
      {item.selected ? (
        <AppIcon icon={Check} size="xs" className="text-brand-600 shrink-0" />
      ) : null}
    </>
  )
}

export function Dropdown({
  items,
  label,
  header,
  open,
  defaultOpen = false,
  onOpenChange,
  renderTrigger,
  triggerVariant = 'outline',
  triggerSize = 'md',
  triggerIcon,
  triggerAriaLabel,
  hideChevron = false,
  disabled = false,
  align = 'left',
  side = 'bottom',
  matchTriggerWidth = false,
  fullWidth = false,
  menuAriaLabel,
  className,
  triggerClassName,
  menuClassName,
}: DropdownProps) {
  const generatedId = useId()
  const triggerId = `${generatedId}-trigger`
  const menuId = `${generatedId}-menu`

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : uncontrolledOpen

  const [focusRequest, setFocusRequest] = useState<{
    intent: FocusIntent
    seq: number
  }>({ intent: 'none', seq: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const handledFocusSeqRef = useRef(0)
  const onOpenChangeRef = useRef(onOpenChange)

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])

  function setMenuOpen(nextOpen: boolean): void {
    if (disabled && nextOpen) {
      return
    }
    if (!isControlled) {
      setUncontrolledOpen(nextOpen)
    }
    if (nextOpen !== isOpen) {
      onOpenChange?.(nextOpen)
    }
  }

  function requestOpenFocus(intent: Exclude<FocusIntent, 'none'>): void {
    setFocusRequest((previous) => ({ intent, seq: previous.seq + 1 }))
  }

  function focusTrigger(): void {
    if (typeof document === 'undefined') {
      return
    }
    document.getElementById(triggerId)?.focus()
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (
      focusRequest.intent !== 'none' &&
      focusRequest.seq !== handledFocusSeqRef.current
    ) {
      handledFocusSeqRef.current = focusRequest.seq
      const enabledItems = getEnabledMenuItems(menuRef.current)
      if (enabledItems.length > 0) {
        const target =
          focusRequest.intent === 'last'
            ? enabledItems[enabledItems.length - 1]
            : enabledItems[0]
        target.focus()
      }
    }
  }, [isOpen, focusRequest])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleOutsideMouseDown(event: MouseEvent): void {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        if (!isControlled) {
          setUncontrolledOpen(false)
        }
        onOpenChangeRef.current?.(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideMouseDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideMouseDown)
    }
  }, [isOpen, isControlled])

  function handleTriggerClick(): void {
    if (disabled) {
      return
    }
    if (!isOpen) {
      requestOpenFocus('first')
      setMenuOpen(true)
    } else {
      setMenuOpen(false)
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (disabled) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isOpen) {
        requestOpenFocus('first')
        setMenuOpen(true)
      } else {
        const menuElement =
          typeof document !== 'undefined'
            ? document.getElementById(menuId)
            : null
        getEnabledMenuItems(menuElement)[0]?.focus()
      }
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen) {
        requestOpenFocus('last')
        setMenuOpen(true)
      } else {
        const menuElement =
          typeof document !== 'undefined'
            ? document.getElementById(menuId)
            : null
        const enabledItems = getEnabledMenuItems(menuElement)
        enabledItems[enabledItems.length - 1]?.focus()
      }
      return
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      setMenuOpen(false)
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setMenuOpen(false)
      focusTrigger()
      return
    }

    if (event.key === 'Tab') {
      setMenuOpen(false)
      return
    }

    const enabledItems = getEnabledMenuItems(event.currentTarget)
    if (enabledItems.length === 0) {
      return
    }

    const currentIndex = enabledItems.findIndex(
      (element) => element === document.activeElement,
    )

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex =
        currentIndex === -1 ? 0 : (currentIndex + 1) % enabledItems.length
      enabledItems[nextIndex]?.focus()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prevIndex =
        currentIndex <= 0 ? enabledItems.length - 1 : currentIndex - 1
      enabledItems[prevIndex]?.focus()
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      enabledItems[0]?.focus()
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      enabledItems[enabledItems.length - 1]?.focus()
      return
    }

    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const typed = event.key.toLowerCase()
      const searchOrder =
        currentIndex >= 0
          ? [
              ...enabledItems.slice(currentIndex + 1),
              ...enabledItems.slice(0, currentIndex + 1),
            ]
          : enabledItems
      const matched = searchOrder.find((item) =>
        item.textContent?.trim().toLowerCase().startsWith(typed),
      )
      if (matched) {
        event.preventDefault()
        matched.focus()
      }
    }
  }

  function handleItemSelect(item: DropdownActionItem): void {
    if (item.disabled) {
      return
    }
    item.onSelect?.()
    if (item.closeOnSelect !== false) {
      setMenuOpen(false)
      if (!item.to && !item.href) {
        focusTrigger()
      }
    }
  }

  const triggerProps: DropdownTriggerProps = {
    id: triggerId,
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? menuId : undefined,
    onClick: handleTriggerClick,
    onKeyDown: handleTriggerKeyDown,
    disabled,
  }

  const showChevron = Boolean(label) && !hideChevron

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative',
        fullWidth ? 'block w-full' : 'inline-block',
        className,
      )}
    >
      {renderTrigger ? (
        renderTrigger({ ...triggerProps, isOpen })
      ) : (
        <Button
          {...triggerProps}
          variant={triggerVariant}
          size={triggerSize}
          fullWidth={fullWidth}
          leftIcon={triggerIcon}
          aria-label={triggerAriaLabel}
          className={triggerClassName}
        >
          {label ? <span className="truncate">{label}</span> : null}
          {showChevron ? (
            <AppIcon
              icon={ChevronDown}
              size="xs"
              className={cn(
                'shrink-0 transition-transform duration-150',
                isOpen && 'rotate-180',
              )}
            />
          ) : null}
        </Button>
      )}

      {isOpen ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={!menuAriaLabel ? triggerId : undefined}
          aria-label={menuAriaLabel}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            'bg-surface-card border-border-subtle absolute z-40 max-h-72 min-w-48 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border p-1.5 shadow-lg focus:outline-none',
            MENU_ORIGIN_CLASSES[side][align],
            matchTriggerWidth && 'w-full',
            menuClassName,
          )}
        >
          {header ? (
            <div className="border-border-subtle mb-1 border-b px-inset-sm py-2">
              {header}
            </div>
          ) : null}

          {items.map((item) => {
            if (item.type === 'separator') {
              return (
                <div
                  key={item.id}
                  role="separator"
                  className="bg-border-subtle my-1 h-px"
                />
              )
            }

            if (item.type === 'label') {
              return (
                <div
                  key={item.id}
                  role="presentation"
                  className="text-caption text-ink-muted px-inset-sm py-1.5 font-semibold tracking-wider uppercase"
                >
                  {item.label}
                </div>
              )
            }

            const itemClassName = getMenuItemClassName({
              tone: item.tone,
              selected: item.selected,
              disabled: item.disabled,
            })

            if (item.to !== undefined && !item.disabled) {
              return (
                <Link
                  key={item.id}
                  role="menuitem"
                  to={item.to}
                  onClick={() => handleItemSelect(item)}
                  className={itemClassName}
                >
                  <DropdownActionContent item={item} />
                </Link>
              )
            }

            if (item.href !== undefined && !item.disabled) {
              return (
                <a
                  key={item.id}
                  role="menuitem"
                  href={item.href}
                  target={item.target}
                  rel={
                    item.rel ??
                    (item.target === '_blank'
                      ? 'noopener noreferrer'
                      : undefined)
                  }
                  onClick={() => handleItemSelect(item)}
                  className={itemClassName}
                >
                  <DropdownActionContent item={item} />
                </a>
              )
            }

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleItemSelect(item)}
                className={itemClassName}
              >
                <DropdownActionContent item={item} />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
