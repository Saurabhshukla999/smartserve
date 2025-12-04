"use client"

import { useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export type ToastType = "success" | "error" | "info"

interface ToastProps {
  id: string
  message: string
  type: ToastType
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const icons = {
    success: <CheckCircle size={20} className="text-success" />,
    error: <AlertCircle size={20} className="text-danger" />,
    info: <Info size={20} className="text-primary" />,
  }

  const bgColor = {
    success: "bg-success/10 border-success/30",
    error: "bg-danger/10 border-danger/30",
    info: "bg-primary/10 border-primary/30",
  }

  return (
    <div className={`${bgColor[type]} border rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm`}>
      {icons[type]}
      <p className="flex-1 text-foreground text-sm">{message}</p>
      <button onClick={() => onClose(id)} className="text-muted-foreground hover:text-foreground transition">
        <X size={16} />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} onClose={onClose} />
      ))}
    </div>
  )
}
