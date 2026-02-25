"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, LogOut } from "lucide-react"

export function Navbar() {
  const { isLoggedIn, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Guest Banner */}
      {!isLoggedIn && (
        <div className="bg-secondary/50 border-b border-secondary text-secondary-foreground px-4 py-3 text-center text-sm">
          You're using SmartSpendHub as a guest —{" "}
          <Link href="/auth/login" className="font-semibold underline hover:no-underline">
            sign up to save your data permanently
          </Link>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-sm font-bold">
                S
              </div>
              SmartSpendHub
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {isLoggedIn && (
                <>
                  <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/modules" className="text-foreground hover:text-primary transition-colors">
                    Modules
                  </Link>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <Link href="/modules" className="text-foreground hover:text-primary transition-colors">
                    Try Modules
                  </Link>
                  <Link href="/features" className="text-foreground hover:text-primary transition-colors">
                    Features
                  </Link>
                </>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              {!isLoggedIn ? (
                <Link href="/auth/login">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                    Get Started
                  </Button>
                </Link>
              ) : (
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors text-sm font-medium"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border space-y-4">
              {isLoggedIn && (
                <>
                  <Link href="/dashboard" className="block text-foreground hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/modules" className="block text-foreground hover:text-primary transition-colors">
                    Modules
                  </Link>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <Link href="/modules" className="block text-foreground hover:text-primary transition-colors">
                    Try Modules
                  </Link>
                  <Link href="/features" className="block text-foreground hover:text-primary transition-colors">
                    Features
                  </Link>
                </>
              )}
              {!isLoggedIn ? (
                <Link href="/auth/login" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">Get Started</Button>
                </Link>
              ) : (
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors font-medium border border-border"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
