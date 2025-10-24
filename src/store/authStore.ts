import { create } from 'zustand'

export type AuthUser = {
  uid: string
  phoneNumber: string | null
}

type AuthState = {
  user: AuthUser | null
  idToken: string | null
  isVerified: boolean
  setAuth: (user: AuthUser, idToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  idToken: null,
  isVerified: false,
  setAuth: (user, idToken) => set({ user, idToken, isVerified: true }),
  clearAuth: () => set({ user: null, idToken: null, isVerified: false }),
}))
