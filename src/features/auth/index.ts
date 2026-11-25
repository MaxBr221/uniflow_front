export {
  AuthShell,
  type AuthShellProps,
} from '@/features/auth/components/AuthShell.tsx'
export {
  useAuthSession,
  type UseAuthSessionResult,
} from '@/features/auth/hooks/useAuthSession.ts'
export { useLoginMutation } from '@/features/auth/hooks/useLoginMutation.ts'
export { useRegisterMutation } from '@/features/auth/hooks/useRegisterMutation.ts'
export {
  LoginPage,
  type LoginFormValues,
  type LoginPageProps,
} from '@/features/auth/pages/LoginPage.tsx'
export {
  RegisterPage,
  type RegisterFormValues,
  type RegisterPageProps,
} from '@/features/auth/pages/RegisterPage.tsx'
export {
  emailSchema,
  loginSchema,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  registerPasswordSchema,
  registerSchema,
} from '@/features/auth/schemas/authSchemas.ts'
export {
  loginUser,
  registerUser,
  toLoginRequest,
  toRegisterRequest,
} from '@/features/auth/services/authService.ts'
export {
  AUTH_SESSION_CHANNEL_NAME,
  authSession,
  bindAuthSessionEffects,
  createAuthSessionManager,
  DEFAULT_EXPIRY_BUFFER_MS,
  initializeAuthHttpClient,
  type AuthSessionEndReason,
  type AuthSessionEvent,
  type AuthSessionManager,
  type AuthSessionState,
  type AuthSessionStatus,
  type BindAuthSessionEffectsOptions,
  type CreateAuthSessionManagerOptions,
  type InitializeAuthHttpClientOptions,
} from '@/features/auth/session/authSession.ts'
export type {
  AuthTokenResponse,
  AuthUserResponse,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  RegisterRequest,
  UserStatus,
} from '@/features/auth/types/authTypes.ts'
