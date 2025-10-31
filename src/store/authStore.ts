import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type AuthUser = {
  uid: string
  email: string | null
  name?: string | null
  phone?: string | null
  photoUrl?: string | null
}

type AuthState = {
  user: AuthUser | null
  idToken: string | null
  isVerified: boolean
  setAuth: (user: AuthUser, idToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      idToken: null,
      isVerified: false,
      setAuth: (user, idToken) => set({ user, idToken, isVerified: true }),
      clearAuth: () => set({ user: null, idToken: null, isVerified: false }),
    }),
    {
      name: 'nearswap-auth',
      storage: createJSONStorage(() => AsyncStorage as any),
      partialize: (state) => ({ user: state.user, idToken: state.idToken }),
    }
  )
)
