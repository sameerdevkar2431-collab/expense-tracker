"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
                All your spending.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                  One smart place.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground text-balance">
                Track smarter, save faster, and make every rupee count. Your intelligent expense tracker with AI-powered
                insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 w-full sm:w-auto">
                  Get Started <ArrowRight size={20} />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 border-primary/30 hover:bg-primary/5 bg-transparent">
                <Play size={20} className="fill-current" />
                View Demo
              </Button>
            </div>
          </div>

          {/* Right Glassmorphic Phone Mockup */}
          <div className="relative h-96 lg:h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-accent/10 rounded-3xl blur-3xl" />
            <div className="relative glass rounded-3xl p-6 soft-shadow w-full max-w-xs h-full flex flex-col">
              {/* Phone Frame Simulation */}
              <div className="bg-gradient-to-br from-card to-muted rounded-2xl flex-1 flex flex-col overflow-hidden border border-white/30">
                {/* Status Bar */}
                <div className="h-6 bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between px-4 text-xs text-muted-foreground">
                  <span>9:41</span>
                  <span>●●●●●</span>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 space-y-3 bg-gradient-to-b from-white/50 to-secondary/30 dark:from-white/10 dark:to-secondary/20 overflow-hidden">
                  {/* Dashboard Preview */}
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-primary/30 to-accent/30 rounded w-3/4" />
                    <div className="h-2 bg-muted rounded w-full" />
                  </div>

                  {/* Mini Cards */}
                  <div className="space-y-2 pt-2">
                    <div className="h-12 bg-gradient-to-r from-primary/20 to-transparent rounded-lg border border-white/20" />
                    <div className="h-12 bg-gradient-to-r from-accent/20 to-transparent rounded-lg border border-white/20" />
                  </div>

                  {/* Chart lines */}
                  <div className="pt-4 space-y-1 opacity-60">
                    <div className="h-1 bg-primary/40 rounded w-full" />
                    <div className="h-1 bg-primary/30 rounded w-5/6" />
                    <div className="h-1 bg-primary/50 rounded w-4/5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
