"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BarChart3, PieChart, TrendingUp, Target, Receipt, Settings } from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: TrendingUp,
      title: "Expense Tracking",
      desc: "Record every expense with category, date, and description. Automatically categorize and visualize spending patterns.",
      details: [
        "Add expenses instantly",
        "Recurring expense support",
        "Receipt image uploads",
        "Category-based organization",
      ],
    },
    {
      icon: BarChart3,
      title: "Real-Time Reports",
      desc: "Generate detailed analytics with interactive charts showing trends, category breakdowns, and monthly comparisons.",
      details: [
        "Line charts for trends",
        "Pie charts for categories",
        "Bar charts for comparisons",
        "Export reports as PDF",
      ],
    },
    {
      icon: Target,
      title: "Budget Planning",
      desc: "Set monthly budgets per category and track spending against your limits in real-time.",
      details: ["Category budgets", "Spending alerts", "Budget vs actual", "Flexible adjustments"],
    },
    {
      icon: PieChart,
      title: "Smart Saving Jar",
      desc: "Set financial goals and track progress towards each goal. Motivating visualizations keep you on track.",
      details: ["Create multiple goals", "Track progress", "Goal milestones", "Achievement badges"],
    },
    {
      icon: Receipt,
      title: "Receipt Management",
      desc: "Upload receipt images and keep organized records of all your transactions with photo references.",
      details: ["Image uploads", "OCR support", "Receipt storage", "Easy retrieval"],
    },
    {
      icon: Settings,
      title: "Category Manager",
      desc: "Create custom categories, edit existing ones, and organize your expenses exactly how you want.",
      details: ["Custom categories", "Color coding", "Icon selection", "Bulk management"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-12 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">Powerful Features</h1>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to take control of your finances
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="bg-secondary/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
