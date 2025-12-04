"use client"

import type React from "react"

import { useState } from "react"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { FormInput } from "@/components/form-input"
import { useAuthStore } from "@/lib/store"
import { useToastStore } from "@/lib/store"
import Link from "next/link"
import { Mail, Lock, Loader } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuthStore()
  const { addToast } = useToastStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
      addToast("Login successful!", "success")
      
      const { user } = useAuthStore.getState()
      
      if (user?.role === "provider") {
        router.push("/provider/dashboard")
      } else {
        router.push("/services")
      }
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please check your credentials."
      setError(errorMessage)
      addToast(errorMessage, "error")
    }
  }

  return (
    <>
      <NavBar isAuthenticated={false} />
      <main className="min-h-screen flex items-center">
        <div className="container-max w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded-lg text-sm">{error}</div>
            )}

            <FormInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-foreground">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-primary hover:text-primary/80">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {isLoading && <Loader size={18} className="animate-spin" />}
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground mb-2">Don't have an account?</p>
            <Link href="/signup" className="text-primary font-semibold hover:text-primary/80">
              Sign up here
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
