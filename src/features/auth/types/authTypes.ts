export type UserStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO' | 'EXCLUIDO'

export interface AuthUserResponse {
  id: string
  nome: string
  email: string
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface RegisterRequest {
  nome: string
  email: string
  senha: string
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface AuthTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  usuario: AuthUserResponse
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface LogoutRequest {
  refreshToken?: string
}
