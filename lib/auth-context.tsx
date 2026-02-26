"use client"

import React, { createContext, useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("[v0] Checking session...")
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("[v0] Session error:", error)
          const stored = storage.getUser()
          if (stored) setUser(stored)
        } else if (data.session?.user) {
          console.log("[v0] Session found, user:", data.session.user.email)
          const sessionUser: User = {
            id: data.session.user.id,
            email: data.session.user.email || "",
            name: data.session.user.user_metadata?.name || data.session.user.email?.split("@")[0] || "",
          }
          setUser(sessionUser)
          storage.setUser(sessionUser)
        } else {
          const stored = storage.getUser()
          if (stored) setUser(stored)
        }
      } catch (err) {
        console.error("[v0] Auth init error:", err)
        const stored = storage.getUser()
        if (stored) setUser(stored)
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [supabase])

  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] Logging in with email:", email)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error("[v0] Login error:", error)
        throw new Error(error.message)
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata?.name || email.split("@")[0],
        }
        storage.setUser(user)
        storage.migrateGuestToUser()
        setUser(user)
        console.log("[v0] Login successful")
      }
    } catch (err) {
      console.error("[v0] Login failed:", err)
      throw err
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    try {
      console.log("[v0] Signing up with email:", email, "name:", name)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) {
        console.error("[v0] Signup error:", error)
        throw new Error(error.message)
      }

      if (data.user) {
        console.log("[v0] User created in Supabase:", data.user.id)
        
        // Create user profile in users table
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          name: name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("[v0] Profile creation error:", profileError)
          throw new Error("Failed to create user profile")
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || "",
          name,
        }
        storage.setUser(user)
        storage.migrateGuestToUser()
        setUser(user)
        console.log("[v0] Signup successful, user email saved to Supabase")
      }
    } catch (err) {
      console.error("[v0] Signup failed:", err)
      throw err
    }
  }

  const logout = async () => {
    try {
      console.log("[v0] Logging out...")
      await supabase.auth.signOut()
      storage.logout()
      setUser(null)
      console.log("[v0] Logout successful")
    } catch (err) {
      console.error("[v0] Logout error:", err)
      // Still clear local state even if signOut fails
      storage.logout()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
