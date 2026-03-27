"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft, ArrowRight } from "lucide-react"
import { sendPasswordResetEmail } from "@/app/actions/password-reset"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("[v0] Sending password reset email to:", email)
      await sendPasswordResetEmail(email)
      console.log("[v0] Password reset email sent successfully")
      setSuccess(true)
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router.push("/auth/reset-password")
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send reset email. Please try again."
      console.error("[v0] Password reset error:", err)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-lg font-bold">
              S
            </div>
            SmartSpendHub
          </Link>
        </div>

        <Card className="border-border/50 glass soft-shadow">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-200">
                  <p className="font-semibold">Check your email!</p>
                  <p className="text-sm mt-1">We&apos;ve sent a password reset link to {email}</p>
                </div>
                <p className="text-sm text-muted-foreground">Redirecting you to reset your password...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">We&apos;ll send a password reset link to this email</p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white text-base gap-2"
                >
                  {isLoading ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Reset Link <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}
