import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import type { RegisterFormValues } from '@/features/auth/schemas/authSchemas.ts'
import {
  registerUser,
  toRegisterRequest,
} from '@/features/auth/services/authService.ts'
import type { AuthUserResponse } from '@/features/auth/types/authTypes.ts'

export function useRegisterMutation(): UseMutationResult<
  AuthUserResponse,
  Error,
  RegisterFormValues
> {
  return useMutation({
    mutationFn: (values: RegisterFormValues) =>
      registerUser(toRegisterRequest(values)),
  })
}
