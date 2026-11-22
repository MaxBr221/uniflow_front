import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'
import { AppIcon, type AppIconSize } from '@/components/AppIcon.tsx'
import { FormField } from '@/components/FormField.tsx'
import {
  FORM_CONTROL_HORIZONTAL_PADDING,
  getFormControlClassName,
  type FormControlSize,
} from '@/components/formControlStyles.ts'
import { cn } from '@/utils/cn.ts'

export type InputSize = FormControlSize

const ICON_SIZE_BY_INPUT: Record<InputSize, AppIconSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'sm',
}

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label?: string
  helperText?: string
  error?: string
  size?: InputSize
  fullWidth?: boolean
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  rightSlot?: ReactNode
  passwordToggle?: boolean
  containerClassName?: string
  ref?: Ref<HTMLInputElement>
}

export function Input({
  id,
  label,
  helperText,
  error,
  size = 'md',
  fullWidth = true,
  leftIcon,
  rightIcon,
  rightSlot,
  passwordToggle = false,
  required = false,
  disabled = false,
  type = 'text',
  className,
  containerClassName,
  'aria-describedby': externalDescribedBy,
  ref,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const canTogglePassword = passwordToggle && type === 'password'
  const resolvedType = canTogglePassword && isPasswordVisible ? 'text' : type
  const hasRightAdornment = Boolean(canTogglePassword || rightSlot || rightIcon)
  const iconSize = ICON_SIZE_BY_INPUT[size]

  return (
    <FormField
      id={id}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      externalDescribedBy={externalDescribedBy}
      fullWidth={fullWidth}
      className={containerClassName}
    >
      {({ controlId, describedBy, hasError }) => (
        <div className="relative flex items-center">
          {leftIcon ? (
            <span className="text-ink-muted pointer-events-none absolute left-3 inline-flex items-center">
              <AppIcon icon={leftIcon} size={iconSize} />
            </span>
          ) : null}

          <input
            ref={ref}
            id={controlId}
            type={resolvedType}
            required={required}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={getFormControlClassName({
              size,
              hasError,
              className: cn(
                FORM_CONTROL_HORIZONTAL_PADDING[size],
                leftIcon && 'pl-9',
                hasRightAdornment && 'pr-10',
                className,
              ),
            })}
            {...props}
          />

          {hasRightAdornment ? (
            <div className="absolute right-3 inline-flex items-center gap-1">
              {canTogglePassword ? (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  aria-label={
                    isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'
                  }
                  className="text-ink-muted hover:text-ink-primary focus-visible:outline-border-focus inline-flex cursor-pointer items-center justify-center rounded-md p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  <AppIcon
                    icon={isPasswordVisible ? EyeOff : Eye}
                    size={iconSize}
                  />
                </button>
              ) : rightSlot ? (
                rightSlot
              ) : rightIcon ? (
                <span className="text-ink-muted pointer-events-none inline-flex items-center">
                  <AppIcon icon={rightIcon} size={iconSize} />
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </FormField>
  )
}
