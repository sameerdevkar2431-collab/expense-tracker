"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { storage } from "@/lib/storage"
import { analytics } from "@/lib/analytics"
import { TrendingUp, TrendingDown, Target, Wallet } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { isLoggedIn, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0, saved: 0 })

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/auth/login")
    }
  }, [isLoggedIn, isLoading, router])

  useEffect(() => {
    console.log("[v0] Fetching dashboard data, isLoggedIn:", isLoggedIn)

    const transactions = storage.getTransactions(isLoggedIn)
    console.log("[v0] Fetched transactions:", transactions.length)

    const currentMonth = new Date().toISOString().substring(0, 7)

    const income = analytics.getTotalIncome(transactions, currentMonth)
    const expenses = analytics.getTotalExpenses(transactions, currentMonth)
    const balance = income - expenses

    const goals = storage.getSavingGoals(isLoggedIn)
    const saved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)

    console.log("[v0] Calculated stats:", { income, expenses, balance, saved })

    setStats({ income, expenses, balance, saved })
  }, [isLoggedIn])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!isLoggedIn) return null

  const statCards = [
    { label: "This Month Income", value: `₹${stats.income.toFixed(0)}`, icon: TrendingUp, color: "text-green-600" },
    { label: "This Month Expenses", value: `₹${stats.expenses.toFixed(0)}`, icon: TrendingDown, color: "text-red-600" },
    {
      label: "Net Balance",
      value: `₹${stats.balance.toFixed(0)}`,
      icon: Wallet,
      color: stats.balance >= 0 ? "text-blue-600" : "text-red-600",
    },
    { label: "Saving Goals", value: `₹${stats.saved.toFixed(0)}`, icon: Target, color: "text-primary" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-8 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Welcome Back!</h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => {
              const Icon = card.icon
              return (
                <div key={i} className="bg-card rounded-lg p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                </div>
              )
            })}
          </div>

          <h2 className="text-xl font-bold text-foreground mb-4">Quick Access</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: "Expenses", icon: "💸", href: "/modules/expenses" },
              { title: "Income", icon: "💰", href: "/modules/income" },
              { title: "Budget", icon: "📊", href: "/modules/budget" },
              { title: "Goals", icon: "🎯", href: "/modules/saving-jar" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="bg-card rounded-lg p-6 border border-border hover:shadow-md hover:border-primary transition-all text-center cursor-pointer"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-semibold text-foreground">{item.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
