import { ChevronDown, type LucideIcon } from 'lucide-react'
import type { ReactNode, Ref, SelectHTMLAttributes } from 'react'
import { AppIcon, type AppIconSize } from '@/components/AppIcon.tsx'
import { FormField } from '@/components/FormField.tsx'
import {
  FORM_CONTROL_HORIZONTAL_PADDING,
  getFormControlClassName,
  type FormControlSize,
} from '@/components/formControlStyles.ts'
import { cn } from '@/utils/cn.ts'

export type SelectSize = FormControlSize

export interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

const ICON_SIZE_BY_SELECT: Record<SelectSize, AppIconSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'sm',
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  label?: string
  helperText?: string
  error?: string
  size?: SelectSize
  fullWidth?: boolean
  leftIcon?: LucideIcon
  placeholder?: string
  options?: readonly SelectOption[]
  containerClassName?: string
  children?: ReactNode
  ref?: Ref<HTMLSelectElement>
}

export function Select({
  id,
  label,
  helperText,
  error,
  size = 'md',
  fullWidth = true,
  leftIcon,
  placeholder,
  options,
  required = false,
  disabled = false,
  className,
  containerClassName,
  'aria-describedby': externalDescribedBy,
  children,
  ref,
  ...props
}: SelectProps) {
  const iconSize = ICON_SIZE_BY_SELECT[size]

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

          <select
            ref={ref}
            id={controlId}
            required={required}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={getFormControlClassName({
              size,
              hasError,
              className: cn(
                'cursor-pointer appearance-none pr-9',
                FORM_CONTROL_HORIZONTAL_PADDING[size],
                leftIcon && 'pl-9',
                className,
              ),
            })}
            {...props}
          >
            {placeholder !== undefined ? (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            ) : null}

            {options
              ? options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              : children}
          </select>

          <span className="text-ink-muted pointer-events-none absolute right-3 inline-flex items-center">
            <AppIcon icon={ChevronDown} size={iconSize} />
          </span>
        </div>
      )}
    </FormField>
  )
}
