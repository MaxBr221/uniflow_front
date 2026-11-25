import {
  useForm,
  type FieldError,
  type FieldValues,
  type Path,
  type UseFormProps,
  type UseFormReturn,
  type UseFormSetError,
} from 'react-hook-form'
import { getHttpFieldErrors } from '@/services/httpClient.ts'

export const DEFAULT_FORM_OPTIONS = {
  mode: 'onTouched',
  reValidateMode: 'onChange',
  shouldFocusError: true,
} as const satisfies Pick<
  UseFormProps,
  'mode' | 'reValidateMode' | 'shouldFocusError'
>

/**
 * Shared React Hook Form wrapper applying UniFlow's default validation and
 * error-focus behavior across all forms.
 */
export function useAppForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>(
  props?: UseFormProps<TFieldValues, TContext, TTransformedValues>,
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  return useForm<TFieldValues, TContext, TTransformedValues>({
    ...DEFAULT_FORM_OPTIONS,
    ...props,
  })
}

export function getFieldErrorMessage(error?: FieldError): string | undefined {
  const message = error?.message?.trim()
  return message && message.length > 0 ? message : undefined
}

/**
 * Maps RFC 7807 `fieldErrors` returned by the API onto React Hook Form fields.
 * Returns `true` when there are general/unmapped errors that should be displayed in a banner.
 */
export function applyHttpFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  fieldMap: Record<string, Path<TFieldValues>>,
  setError: UseFormSetError<TFieldValues>,
): boolean {
  const apiFieldErrors = getHttpFieldErrors(error)
  if (apiFieldErrors.length === 0) {
    return true
  }

  let mappedCount = 0
  for (const fieldError of apiFieldErrors) {
    const targetField = fieldMap[fieldError.field]
    if (targetField) {
      setError(targetField, {
        type: 'server',
        message: fieldError.message,
      })
      mappedCount += 1
    }
  }

  return mappedCount < apiFieldErrors.length
}
