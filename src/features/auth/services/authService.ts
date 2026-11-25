import type {
  LoginFormValues,
  RegisterFormValues,
} from '@/features/auth/schemas/authSchemas.ts'
import type {
  AuthTokenResponse,
  AuthUserResponse,
  LoginRequest,
  RegisterRequest,
} from '@/features/auth/types/authTypes.ts'
import { httpClient } from '@/services/httpClient.ts'

export function toRegisterRequest(
  values: Pick<RegisterFormValues, 'name' | 'email' | 'password'>,
): RegisterRequest {
  return {
    nome: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    senha: values.password,
  }
}

export async function registerUser(
  payload: RegisterRequest,
): Promise<AuthUserResponse> {
  const response = await httpClient.post<AuthUserResponse>(
    '/auth/register',
    payload,
  )
  return response.data
}

export function toLoginRequest(
  values: Pick<LoginFormValues, 'email' | 'password'>,
): LoginRequest {
  return {
    email: values.email.trim().toLowerCase(),
    senha: values.password,
  }
}

export async function loginUser(
  payload: LoginRequest,
): Promise<AuthTokenResponse> {
  const response = await httpClient.post<AuthTokenResponse>(
    '/auth/login',
    payload,
  )
  return response.data
}
