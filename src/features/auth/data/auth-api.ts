import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  access_token: string
}

type JwtPayload = {
  sub: number
  email: string
  role: string
  iat?: number
  exp?: number
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const json =
      typeof atob === 'function'
        ? atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        : Buffer.from(payload, 'base64').toString('utf-8')
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}

export function useLogin() {
  return useMutation({ mutationFn: login })
}
