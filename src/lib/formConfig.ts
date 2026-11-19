import {
  useForm,
  type FieldError,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form'

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
