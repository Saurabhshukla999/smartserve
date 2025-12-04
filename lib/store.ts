"use client"

import { create } from "zustand"
import { authApi } from "@/lib/api-client"
import { ToastContainer } from "@/components/toast-container"

export interface User {
  id: number
  name: string
  email: string
  role: "user" | "provider"
  phone: string
  avatar?: string
  location?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: "user" | "provider", phone: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const response = await authApi.login(email, password)
      const { token, user } = response.data

      // Store token in localStorage (with security note: ideally use httpOnly cookie)
      localStorage.setItem("authToken", token)

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({ isLoading: false })
      throw new Error(error.response?.data?.error || "Login failed")
    }
  },

  signup: async (name, email, password, role, phone) => {
    set({ isLoading: true })
    try {
      const response = await authApi.signup({
        name,
        email,
        password,
        role,
        phone,
      })
      const { token, user } = response.data

      // Store token in localStorage (with security note: ideally use httpOnly cookie)
      localStorage.setItem("authToken", token)

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({ isLoading: false })
      throw new Error(error.response?.data?.error || "Signup failed")
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      set({ isAuthenticated: false, user: null })
      return
    }

    set({ isLoading: true })
    try {
      const response = await authApi.getMe()
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      localStorage.removeItem("authToken")
      set({ isAuthenticated: false, user: null, isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem("authToken")
    set({
      user: null,
      isAuthenticated: false,
    })
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    })
  },
}))

export interface ToastMessage {
  id: string
  message: string
  type: "success" | "error" | "info"
}

export interface ToastState {
  toasts: ToastMessage[]
  addToast: (message: string, type: "success" | "error" | "info") => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }))
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

export { ToastContainer }
