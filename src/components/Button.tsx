import { Loader2, type LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { Link, type LinkProps } from 'react-router'
import { AppIcon, type AppIconSize } from '@/components/AppIcon.tsx'
import { cn } from '@/utils/cn.ts'

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const BASE_BUTTON_CLASSES =
  'inline-flex items-center justify-center font-medium whitespace-nowrap select-none cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:pointer-events-none disabled:opacity-55'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-ink-inverse shadow-xs hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200/70',
  outline:
    'border border-border-default bg-surface-card text-ink-primary hover:border-border-strong hover:bg-surface-subtle',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-surface-subtle hover:text-ink-primary',
  danger:
    'bg-danger-600 text-ink-inverse shadow-xs hover:bg-danger-700 active:bg-danger-700',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-inset-sm gap-stack-xs rounded-lg text-body-sm',
  md: 'h-10 px-inset-md gap-stack-sm rounded-xl text-body-sm',
  lg: 'h-11 px-inset-lg gap-stack-sm rounded-xl text-body',
  icon: 'h-10 w-10 p-0 rounded-xl',
}

const ICON_SIZE_BY_BUTTON: Record<ButtonSize, AppIconSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
  icon: 'sm',
}

interface SharedButtonVisualProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  isLoading?: boolean
  loadingText?: string
  children?: ReactNode
}

function buildButtonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}): string {
  return cn(
    BASE_BUTTON_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
    className,
  )
}

function ButtonContent({
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  loadingText,
  children,
}: Pick<
  SharedButtonVisualProps,
  'size' | 'leftIcon' | 'rightIcon' | 'isLoading' | 'loadingText' | 'children'
>) {
  const iconSize = ICON_SIZE_BY_BUTTON[size]

  return (
    <>
      {isLoading ? (
        <AppIcon icon={Loader2} size={iconSize} className="animate-spin" />
      ) : leftIcon ? (
        <AppIcon icon={leftIcon} size={iconSize} />
      ) : null}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && rightIcon ? (
        <AppIcon icon={rightIcon} size={iconSize} />
      ) : null}
    </>
  )
}

export interface ButtonProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
    SharedButtonVisualProps {
  type?: 'button' | 'submit' | 'reset'
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  loadingText,
  disabled = false,
  type = 'button',
  className,
  children,
  ref,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={buildButtonClassName({ variant, size, fullWidth, className })}
      {...props}
    >
      <ButtonContent
        size={size}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        isLoading={isLoading}
        loadingText={loadingText}
      >
        {children}
      </ButtonContent>
    </button>
  )
}

export interface ButtonLinkProps
  extends
    LinkProps,
    Omit<SharedButtonVisualProps, 'isLoading' | 'loadingText'> {
  ref?: Ref<HTMLAnchorElement>
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  ref,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      ref={ref}
      className={buildButtonClassName({ variant, size, fullWidth, className })}
      {...props}
    >
      <ButtonContent size={size} leftIcon={leftIcon} rightIcon={rightIcon}>
        {children}
      </ButtonContent>
    </Link>
  )
}
