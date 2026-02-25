"use client"

import React, { createContext, useState, useEffect } from "react"
import { storage } from "@/lib/storage"

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
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = storage.getUser()
    if (stored) setUser(stored)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login - in production, validate against backend
    const user: User = {
      id: Date.now().toString(),
      email,
      name: email.split("@")[0],
    }
    storage.setUser(user)
    storage.migrateGuestToUser()
    setUser(user)
  }

  const signup = async (email: string, password: string, name: string) => {
    // Mock signup - in production, create user on backend
    const user: User = {
      id: Date.now().toString(),
      email,
      name,
    }
    storage.setUser(user)
    storage.migrateGuestToUser()
    setUser(user)
  }

  const logout = () => {
    storage.logout()
    setUser(null)
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
