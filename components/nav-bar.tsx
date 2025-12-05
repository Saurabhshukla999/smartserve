"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, LogOut, User } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { useToastStore } from "@/lib/store"
import { NotificationsCenter } from "@/components/notifications-center"

interface NavBarProps {
  isAuthenticated?: boolean
  userRole?: "user" | "provider"
}

export function NavBar({ isAuthenticated = false, userRole = "user" }: NavBarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuthStore()
  const { addToast } = useToastStore()

  const handleLogout = () => {
    logout()
    addToast("Logged out successfully", "success")
    router.push("/")
    setMenuOpen(false)
  }

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container-max flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Smartserve
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {!isAuthenticated ? (
            <>
              <Link href="/services" className="text-foreground hover:text-primary transition">
                Browse Services
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link href="/services" className="text-foreground hover:text-primary transition">
                Browse
              </Link>
              {userRole === "user" && (
                <>
                  <Link href="/dashboard" className="text-foreground hover:text-primary transition">
                    Dashboard
                  </Link>
                  <Link href="/bookings" className="text-foreground hover:text-primary transition">
                    My Bookings
                  </Link>
                </>
              )}
              {userRole === "provider" && (
                <>
                  <NotificationsCenter />
                  <Link href="/provider/dashboard" className="text-foreground hover:text-primary transition">
                    Dashboard
                  </Link>
                </>
              )}
              <Link href="/profile" className="flex items-center gap-2 text-foreground hover:text-primary transition">
                <User size={18} />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-foreground hover:text-destructive transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 md:hidden">
            {!isAuthenticated ? (
              <>
                <Link href="/services" className="text-foreground hover:text-primary">
                  Browse Services
                </Link>
                <Link href="/login" className="text-foreground hover:text-primary">
                  Login
                </Link>
                <Link href="/signup" className="text-foreground hover:text-primary">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link href="/services" className="text-foreground hover:text-primary">
                  Browse
                </Link>
                {userRole === "user" && (
                  <>
                    <Link href="/dashboard" className="text-foreground hover:text-primary">
                      Dashboard
                    </Link>
                    <Link href="/bookings" className="text-foreground hover:text-primary">
                      My Bookings
                    </Link>
                  </>
                )}
                {userRole === "provider" && (
                  <Link href="/provider/dashboard" className="text-foreground hover:text-primary">
                    Dashboard
                  </Link>
                )}
                <Link href="/profile" className="text-foreground hover:text-primary">
                  Profile
                </Link>
                <button onClick={handleLogout} className="text-foreground hover:text-destructive text-left">
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
