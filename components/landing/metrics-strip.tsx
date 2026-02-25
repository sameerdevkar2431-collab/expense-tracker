"use client"

import { Card } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Target } from "lucide-react"

export function MetricsStrip() {
  const metrics = [
    {
      label: "Monthly Spending",
      value: "₹45,320",
      change: "-12%",
      isPositive: true,
      comparison: "vs last month",
      icon: TrendingDown,
      color: "text-destructive",
    },
    {
      label: "Saved This Month",
      value: "₹8,750",
      change: "+8%",
      isPositive: true,
      comparison: "vs last month",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      label: "Active Goals",
      value: "5",
      change: "2 close to completion",
      isPositive: true,
      comparison: "",
      icon: Target,
      color: "text-accent",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-transparent to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon
            return (
              <Card
                key={idx}
                className="glass soft-shadow border-border/50 p-6 space-y-4 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <h3 className="text-3xl font-bold text-foreground">{metric.value}</h3>
                  </div>
                  <Icon className={`${metric.color} opacity-70`} size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{metric.change}</span>
                  <span className="text-xs text-muted-foreground">{metric.comparison}</span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
