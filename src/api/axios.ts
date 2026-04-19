import axios from "axios"

const AUTH_TOKEN_KEY = "authToken"

function stripEmptyParams<T extends object>(params: T): Partial<T> {
  const entries = Object.entries(params as Record<string, unknown>).filter(([, value]) => {
    if (value === undefined || value === null) return false
    if (typeof value === "string" && value.trim() === "") return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  })

  return Object.fromEntries(entries) as Partial<T>
}

export { stripEmptyParams }

export const axiosInstance = axios.create({
  baseURL: "http://localhost:9000",
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        window.localStorage.removeItem(AUTH_TOKEN_KEY)
      } catch {
        // ignore
      }
      // No dedicated auth page in this repo; fall back to root.
      if (typeof window !== "undefined") window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

