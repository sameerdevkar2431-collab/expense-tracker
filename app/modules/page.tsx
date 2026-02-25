"use client"

import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"

export default function ModulesPage() {
  const { isLoggedIn } = useAuth()

  const modules = [
    {
      id: "expenses",
      title: "Expense Manager",
      description: "Track, categorize, and analyze your spending across different categories",
      icon: "💸",
      href: isLoggedIn ? "/modules/expenses" : "/modules/expenses?mode=guest",
      ctaText: isLoggedIn ? "Open" : "Try Free",
    },
    {
      id: "budget",
      title: "Budget Planner",
      description: "Set monthly budgets and monitor spending against your limits",
      icon: "📊",
      href: isLoggedIn ? "/modules/budget" : "/modules/budget?mode=guest",
      ctaText: isLoggedIn ? "Open" : "Try Free",
    },
    {
      id: "saving-jar",
      title: "Smart Saving Jar",
      description: "Create goals and track progress towards your financial objectives",
      icon: "🎯",
      href: isLoggedIn ? "/modules/saving-jar" : "/modules/saving-jar?mode=guest",
      ctaText: isLoggedIn ? "Open" : "Try Free",
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      description: "Visualize your spending with interactive charts and detailed reports",
      icon: "📈",
      href: isLoggedIn ? "/modules/reports" : "/modules/reports?mode=guest",
      ctaText: isLoggedIn ? "Open" : "Try Free",
    },
    {
      id: "receipt",
      title: "Receipt Upload",
      description: "Capture and store receipt images for your transactions",
      icon: "🧾",
      href: isLoggedIn ? "/modules/receipt" : "/modules/receipt?mode=guest",
      ctaText: isLoggedIn ? "Open" : "Try Free",
    },
    {
      id: "settings",
      title: "Settings",
      description: "Export data, import data, and manage your account settings",
      icon: "⚙️",
      href: isLoggedIn ? "/modules/settings" : "/auth/login",
      ctaText: isLoggedIn ? "Open" : "Sign In",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-12 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">All Modules</h1>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {isLoggedIn
              ? "Access all your financial management tools"
              : "Try any module free in guest mode. Your data is saved locally!"}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer"
              >
                <div className="text-4xl mb-4">{module.icon}</div>
                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{module.description}</p>

                {/* Try banner for guests */}
                {!isLoggedIn && module.id !== "settings" && (
                  <div className="bg-secondary/20 rounded-lg p-3 mb-4 text-xs text-secondary-foreground font-semibold">
                    Guest mode - data saved locally
                  </div>
                )}

                <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                  {module.ctaText}
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>

          {!isLoggedIn && (
            <div className="mt-12 bg-secondary/10 rounded-xl p-8 text-center border border-secondary">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold text-foreground mb-2">Want to save permanently?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                All guest data is stored locally. Sign up to save your data to the cloud and access it from anywhere.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Create Free Account <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
