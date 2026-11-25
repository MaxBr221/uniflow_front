import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import type { LoginFormValues } from '@/features/auth/schemas/authSchemas.ts'
import {
  loginUser,
  toLoginRequest,
} from '@/features/auth/services/authService.ts'
import { authSession } from '@/features/auth/session/authSession.ts'
import type { AuthTokenResponse } from '@/features/auth/types/authTypes.ts'

export function useLoginMutation(): UseMutationResult<
  AuthTokenResponse,
  Error,
  LoginFormValues
> {
  return useMutation({
    mutationFn: (values: LoginFormValues) => loginUser(toLoginRequest(values)),
    onSuccess: (response) => {
      authSession.setSession(response)
    },
  })
}
