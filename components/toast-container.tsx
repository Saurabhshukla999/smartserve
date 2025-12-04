"use client"

import type { ToastMessage } from "@/lib/store"

interface ToastContainerProps {
  toasts: ToastMessage[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <p>{toast.message}</p>
            <button onClick={() => onClose(toast.id)} className="text-white hover:opacity-80" aria-label="Close toast">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
