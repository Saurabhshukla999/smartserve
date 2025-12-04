"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check } from "lucide-react"
import { useAuthStore } from "@/lib/store"

interface Notification {
  id: string
  title: string
  message: string
  type: "booking" | "review" | "system"
  read: boolean
  createdAt: string
  actionUrl?: string
}

export function NotificationsCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications()
    }
  }, [isOpen, user])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/provider/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/provider/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/provider/notifications/${id}`, {
        method: "DELETE",
      })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (!user || user.role !== "provider") return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-border last:border-b-0 ${!notification.read ? "bg-muted/50" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{notification.title}</h4>
                      {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        <Check size={14} />
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
