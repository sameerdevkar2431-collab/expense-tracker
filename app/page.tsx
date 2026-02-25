"use client"

import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, TrendingUp, PieChart, Target, Receipt, BarChart3 } from "lucide-react"

export default function Home() {
  const { isLoggedIn } = useAuth()

  const features = [
    { icon: TrendingUp, title: "Expense Tracking", desc: "Track every rupee spent across categories" },
    { icon: PieChart, title: "Smart Analytics", desc: "Visualize spending patterns with real charts" },
    { icon: Target, title: "Budget Planning", desc: "Set monthly budgets and stay within limits" },
    { icon: BarChart3, title: "Saving Goals", desc: "Track progress towards your financial goals" },
    { icon: Receipt, title: "Receipt Upload", desc: "Capture and organize receipts easily" },
  ]

  const demoMetrics = [
    { label: "Total Expenses", value: "₹12,450", change: "+5.2%" },
    { label: "Total Income", value: "₹45,000", change: "+8.1%" },
    { label: "Saved This Month", value: "₹8,250", change: "+12.3%" },
    { label: "Budget Status", value: "72% Used", change: "-3.2%" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Track Smarter, Save Faster
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
              All your spending. One smart place. Manage expenses, reach savings goals, and make every rupee count.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/modules"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Try Now (Free) <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/5 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Demo Metrics for Guests */}
          {!isLoggedIn && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-secondary">
              <p className="text-center text-sm font-semibold text-primary mb-6 uppercase tracking-wider">Demo Data</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {demoMetrics.map((metric, i) => (
                  <div key={i} className="text-center">
                    <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                    <p className="text-sm text-muted-foreground mt-2">{metric.label}</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">{metric.change}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Powerful Features, Made Simple
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-secondary/20 dark:bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Guest Mode Banner */}
      {!isLoggedIn && (
        <section className="py-12 px-4 md:px-6 lg:px-8 bg-secondary/10">
          <div className="max-w-6xl mx-auto bg-secondary/30 dark:bg-secondary/20 rounded-xl p-8 text-center border border-secondary">
            <p className="text-lg font-semibold text-foreground mb-4">
              Using SmartSpendHub in guest mode — everything works locally!
            </p>
            <p className="text-muted-foreground mb-6">
              Sign up to save your data permanently and access it from any device.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign Up Now <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
