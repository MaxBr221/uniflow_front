import {
  useState,
  type ChangeEvent,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react'
import { FormField } from '@/components/FormField.tsx'
import {
  FORM_CONTROL_HORIZONTAL_PADDING,
  getFormControlClassName,
  type FormControlSize,
} from '@/components/formControlStyles.ts'
import { cn } from '@/utils/cn.ts'

export type TextareaSize = FormControlSize
export type TextareaResize = 'none' | 'vertical' | 'both'

const RESIZE_CLASSES: Record<TextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  both: 'resize',
}

function getInitialLength(
  value: TextareaHTMLAttributes<HTMLTextAreaElement>['value'],
  defaultValue: TextareaHTMLAttributes<HTMLTextAreaElement>['defaultValue'],
): number {
  const source = value ?? defaultValue
  if (typeof source === 'string') {
    return source.length
  }
  if (typeof source === 'number') {
    return String(source).length
  }
  return 0
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  size?: TextareaSize
  resize?: TextareaResize
  fullWidth?: boolean
  showCount?: boolean
  containerClassName?: string
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({
  id,
  label,
  helperText,
  error,
  size = 'md',
  resize = 'vertical',
  fullWidth = true,
  showCount = false,
  rows = 4,
  required = false,
  disabled = false,
  maxLength,
  value,
  defaultValue,
  onChange,
  className,
  containerClassName,
  'aria-describedby': externalDescribedBy,
  ref,
  ...props
}: TextareaProps) {
  const [uncontrolledLength, setUncontrolledLength] = useState(() =>
    getInitialLength(value, defaultValue),
  )

  const currentLength =
    value !== undefined
      ? getInitialLength(value, undefined)
      : uncontrolledLength

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    if (value === undefined) {
      setUncontrolledLength(event.target.value.length)
    }
    onChange?.(event)
  }

  const counterText = showCount
    ? maxLength !== undefined
      ? `${currentLength}/${maxLength}`
      : String(currentLength)
    : null

  return (
    <FormField
      id={id}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      externalDescribedBy={externalDescribedBy}
      footerEnd={
        counterText !== null ? (
          <span
            aria-hidden="true"
            className="text-caption text-ink-muted tabular-nums"
          >
            {counterText}
          </span>
        ) : undefined
      }
      fullWidth={fullWidth}
      className={containerClassName}
    >
      {({ controlId, describedBy, hasError }) => (
        <textarea
          ref={ref}
          id={controlId}
          rows={rows}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={getFormControlClassName({
            size,
            hasError,
            multiline: true,
            className: cn(
              'leading-relaxed',
              FORM_CONTROL_HORIZONTAL_PADDING[size],
              RESIZE_CLASSES[resize],
              className,
            ),
          })}
          {...props}
        />
      )}
    </FormField>
  )
}
