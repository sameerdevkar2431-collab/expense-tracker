"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { storage } from "@/lib/storage"
import { analytics } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from "lucide-react"

export default function BudgetModule() {
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("mode") === "guest"
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [newBudget, setNewBudget] = useState({ category: "", limit: "" })

  useEffect(() => {
    setBudgets(storage.getBudgets(false))
    setCategories(storage.getCategories(false).filter((c) => c.type === "expense"))
    setTransactions(storage.getTransactions(false))
  }, [])

  const handleAddBudget = (e) => {
    e.preventDefault()
    if (!newBudget.category || !newBudget.limit) return

    const updated = [
      ...budgets,
      { ...newBudget, limit: Number.parseFloat(newBudget.limit), month: new Date().toISOString().substring(0, 7) },
    ]
    storage.setBudgets(updated, false)
    setBudgets(updated)
    setNewBudget({ category: "", limit: "" })
  }

  const handleDeleteBudget = (category) => {
    const updated = budgets.filter((b) => b.category !== category)
    storage.setBudgets(updated, false)
    setBudgets(updated)
  }

  const budgetStatus = analytics.getBudgetStatus(transactions, budgets)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-8 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Budget Planner</h1>
          {isGuest && <p className="text-sm text-muted-foreground mb-6">Guest mode - data saved locally</p>}

          <div className="bg-card rounded-lg p-6 border border-border mb-8">
            <h2 className="font-bold text-lg text-foreground mb-4">Set Monthly Budgets</h2>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border bg-background"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="Budget Limit (₹)"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                  step="0.01"
                  required
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                  <Plus size={16} className="mr-2" />
                  Add Budget
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-lg text-foreground">Budget Status</h2>
            {budgetStatus.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No budgets set yet. Create one to get started!</p>
            ) : (
              budgetStatus.map((budget, i) => (
                <div key={i} className="bg-card rounded-lg p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-foreground">{budget.category}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{budget.spent.toFixed(0)} of ₹{budget.limit.toFixed(0)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteBudget(budget.category)}
                      className="p-2 hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${budget.percentage > 100 ? "bg-destructive" : budget.percentage > 80 ? "bg-yellow-500" : "bg-primary"}`}
                      style={{ width: `${Math.min(100, budget.percentage)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{budget.percentage.toFixed(0)}% Used</span>
                    <span>₹{budget.remaining.toFixed(0)} Remaining</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
