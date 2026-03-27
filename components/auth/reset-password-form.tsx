"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Lock, ArrowLeft, ArrowRight } from "lucide-react"
import { resetPasswordWithOtp } from "@/app/actions/password-reset"

export function ResetPasswordForm() {
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get token from URL if user clicked the email link
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      console.log("[v0] Found reset token in URL")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Resetting password with OTP")
      // Use token from URL if available, otherwise use OTP
      const identifier = token || otp
      await resetPasswordWithOtp(identifier, password)
      console.log("[v0] Password reset successfully")
      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to reset password. Please try again."
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
            <CardTitle className="text-2xl">Create New Password</CardTitle>
            <CardDescription>Enter the OTP from your email and set a new password</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-200">
                  <p className="font-semibold">Password reset successful!</p>
                  <p className="text-sm mt-1">You can now log in with your new password</p>
                </div>
                <p className="text-sm text-muted-foreground">Redirecting you to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

                {!token && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">OTP Code</label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP from your email"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.toUpperCase())}
                      maxLength={6}
                      required={!token}
                    />
                    <p className="text-xs text-muted-foreground">Check your email for the OTP code</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white text-base gap-2"
                >
                  {isLoading ? (
                    "Resetting..."
                  ) : (
                    <>
                      Reset Password <ArrowRight size={18} />
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
