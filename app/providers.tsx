"use client"

import type React from "react"
import { useEffect } from "react"
import { ToastContainer, useToastStore, useAuthStore } from "@/lib/store"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToastStore()
  const { fetchUser } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  )
}
