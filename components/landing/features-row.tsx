"use client"

import { Card } from "@/components/ui/card"
import { Camera, PiggyBank as Piggy } from "lucide-react"

export function FeaturesRow() {
  const features = [
    {
      icon: Camera,
      title: "Photo Receipt Scanner",
      description: "Snap receipts with OCR technology to auto-parse expenses with manual edit capability",
      color: "from-primary/20 to-primary/5",
    },
    {
      icon: Piggy,
      title: "Smart Saving Jar",
      description: "Set targets and get AI-suggested monthly amounts with visual progress tracking",
      color: "from-accent/20 to-accent/5",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Core Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to take control of your finances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <Card
                key={idx}
                className={`glass soft-shadow border-border/50 p-8 space-y-6 hover:shadow-xl transition-all hover:border-primary/30 group cursor-pointer`}
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className="text-primary" size={28} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
