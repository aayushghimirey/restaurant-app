import { create } from "zustand"
import { persist } from "zustand/middleware"
import { AuthResponse } from "../types"

interface AuthState {
  token: string | null
  username: string | null
  role: string | null
  isAuthenticated: boolean
  setAuth: (data: AuthResponse) => void
  logout: () => void
}

const AUTH_TOKEN_KEY = "authToken"

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: localStorage.getItem(AUTH_TOKEN_KEY),
      username: null,
      role: null,
      isAuthenticated: !!localStorage.getItem(AUTH_TOKEN_KEY),
      setAuth: (data) => {
        console.log("AuthStore: Setting auth state", { username: data.username, role: data.role });
        localStorage.setItem(AUTH_TOKEN_KEY, data.token)
        set({
          token: data.token,
          username: data.username,
          role: data.role,
          isAuthenticated: true,
        })
      },
      logout: () => {
        console.log("AuthStore: Logging out");
        localStorage.removeItem(AUTH_TOKEN_KEY)
        set({
          token: null,
          username: null,
          role: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: "auth-storage",
    }
  )
)
