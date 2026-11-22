import { useId, type ReactNode } from 'react'
import { SPACING_CLASSES } from '@/styles/spacing.ts'
import { cn } from '@/utils/cn.ts'

export interface FormFieldRenderContext {
  readonly controlId: string
  readonly describedBy: string | undefined
  readonly hasError: boolean
}

export interface FormFieldProps {
  id?: string
  label?: string
  required?: boolean
  helperText?: string
  error?: string
  externalDescribedBy?: string
  footerEnd?: ReactNode
  fullWidth?: boolean
  className?: string
  children: (context: FormFieldRenderContext) => ReactNode
}

export function FormField({
  id,
  label,
  required = false,
  helperText,
  error,
  externalDescribedBy,
  footerEnd,
  fullWidth = true,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const normalizedError = error?.trim()
  const hasError = Boolean(normalizedError)
  const errorId = hasError ? `${controlId}-error` : undefined
  const helperId = !hasError && helperText ? `${controlId}-helper` : undefined
  const describedBy =
    [errorId, helperId, externalDescribedBy].filter(Boolean).join(' ') ||
    undefined
  const hasFooter = Boolean(hasError || helperText || footerEnd)

  return (
    <div
      className={cn(
        SPACING_CLASSES.fieldStack,
        fullWidth ? 'w-full' : 'inline-flex',
        className,
      )}
    >
      {label ? (
        <label
          htmlFor={controlId}
          className="text-body-sm text-ink-primary font-medium"
        >
          {label}
          {required ? (
            <span className="text-danger-600 ml-1" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children({ controlId, describedBy, hasError })}

      {hasFooter ? (
        <div className="flex items-start justify-between gap-stack-sm">
          <div className="min-w-0 flex-1">
            {hasError ? (
              <p
                id={errorId}
                role="alert"
                className="text-caption text-danger-700 font-medium"
              >
                {normalizedError}
              </p>
            ) : helperText ? (
              <p id={helperId} className="text-caption text-ink-muted">
                {helperText}
              </p>
            ) : null}
          </div>
          {footerEnd ? <div className="shrink-0">{footerEnd}</div> : null}
        </div>
      ) : null}
    </div>
  )
}
