export interface AuthRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  username: string
  role: string
}

export interface TenantRequest {
  companyName: string
  email: string
  username: string
  password: string
  adminPhone: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}
