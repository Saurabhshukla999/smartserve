"use client"

import type React from "react"

import { useState } from "react"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { FormInput } from "@/components/form-input"
import { useAuthStore } from "@/lib/store"
import { useToastStore } from "@/lib/store"
import Link from "next/link"
import { Mail, Lock, User, Phone, Loader } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })
  const [role, setRole] = useState<"user" | "provider">("user")
  const [error, setError] = useState("")
  const { signup, isLoading } = useAuthStore()
  const { addToast } = useToastStore()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!formData.phone) {
      setError("Phone number is required")
      return
    }

    try {
      await signup(formData.name, formData.email, formData.password, role, formData.phone)
      addToast("Account created successfully!", "success")
      router.push(role === "provider" ? "/provider/dashboard" : "/services")
    } catch (err: any) {
      const errorMessage = err.message || "Signup failed. Please try again."
      setError(errorMessage)
      addToast(errorMessage, "error")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      <NavBar isAuthenticated={false} />
      <main className="min-h-screen flex items-center">
        <div className="container-max w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join our trusted service community</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded-lg text-sm">{error}</div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">I am a...</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex-1 py-2 px-4 rounded-lg border transition ${
                    role === "user"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Service Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setRole("provider")}
                  className={`flex-1 py-2 px-4 rounded-lg border transition ${
                    role === "provider"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Service Provider
                </button>
              </div>
            </div>

            <FormInput
              label="Full Name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              icon={<User size={18} />}
              required
            />

            <FormInput
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              icon={<Mail size={18} />}
              required
            />

            <FormInput
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleInputChange}
              icon={<Phone size={18} />}
              required
            />

            <FormInput
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              icon={<Lock size={18} />}
              required
            />

            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              icon={<Lock size={18} />}
              required
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" required className="rounded" />
              <span className="text-sm text-foreground">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:text-primary/80">
                  Terms of Service
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {isLoading && <Loader size={18} className="animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground mb-2">Already have an account?</p>
            <Link href="/login" className="text-primary font-semibold hover:text-primary/80">
              Sign in here
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
