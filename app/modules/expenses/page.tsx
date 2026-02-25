"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { storage } from "@/lib/storage"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2, Plus } from "lucide-react"

interface Transaction {
  id: string
  type: "expense" | "income"
  amount: number
  category: string
  description?: string
  date: string
  recurring?: boolean
  receiptUrl?: string
}

export default function ExpensesModule() {
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("mode") === "guest"
  const { isLoggedIn } = useAuth()
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Load expenses - from Supabase if logged in, from localStorage if guest
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setError("")
        if (isLoggedIn) {
          console.log("[v0] Loading expenses from Supabase")
          const response = await fetch("/api/transactions", {
            method: "GET",
            credentials: "include",
          })

          if (!response.ok) {
            console.error("[v0] Failed to fetch from API:", response.status)
            if (response.status === 401) {
              // Not authenticated, fall back to localStorage
              setExpenses(storage.getTransactions(false).filter((t) => t.type === "expense"))
            } else {
              setError("Failed to load expenses from server")
            }
            return
          }

          const data = await response.json()
          console.log("[v0] Fetched from Supabase:", data.transactions?.length || 0, "expenses")
          setExpenses(data.transactions?.filter((t: Transaction) => t.type === "expense") || [])
        } else {
          console.log("[v0] Loading expenses from localStorage (guest mode)")
          setExpenses(storage.getTransactions(false).filter((t) => t.type === "expense"))
        }
      } catch (err) {
        console.error("[v0] Error loading expenses:", err)
        setError("Failed to load expenses")
        // Fall back to localStorage
        setExpenses(storage.getTransactions(false).filter((t) => t.type === "expense"))
      }
    }

    loadExpenses()
    setCategories(storage.getCategories(false).filter((c) => c.type === "expense"))
  }, [isLoggedIn])

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category) return

    setLoading(true)
    setError("")

    try {
      const expenseData = {
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        type: "expense",
      }

      if (isLoggedIn) {
        console.log("[v0] Saving expense to Supabase")
        const response = await fetch("/api/transactions", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("[v0] API error:", errorData)
          setError(errorData.error || "Failed to save expense")
          return
        }

        const data = await response.json()
        console.log("[v0] Successfully saved to Supabase:", data.transaction?.id)
        setExpenses([data.transaction, ...expenses])
      } else {
        console.log("[v0] Saving expense to localStorage (guest mode)")
        storage.addTransaction(expenseData, false)
        const updatedExpenses = storage.getTransactions(false).filter((t) => t.type === "expense")
        setExpenses(updatedExpenses)
      }

      setFormData({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      })
      setEditingId(null)
    } catch (err) {
      console.error("[v0] Error saving expense:", err)
      setError("Failed to save expense. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Delete this expense?")) return

    setLoading(true)
    setError("")

    try {
      if (isLoggedIn) {
        // TODO: Create DELETE /api/transactions/[id] endpoint
        console.log("[v0] Would delete from Supabase:", id)
        // For now, delete from localStorage
        storage.deleteTransaction(id, false)
      } else {
        storage.deleteTransaction(id, false)
      }

      const updatedExpenses = storage.getTransactions(false).filter((t) => t.type === "expense")
      setExpenses(updatedExpenses)
    } catch (err) {
      console.error("[v0] Error deleting expense:", err)
      setError("Failed to delete expense")
    } finally {
      setLoading(false)
    }
  }

  const handleEditExpense = (expense: Transaction) => {
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || "",
      date: expense.date,
    })
    setEditingId(expense.id)
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-8 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Expense Manager</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isLoggedIn ? "Saving to Supabase" : "Guest mode - data saved locally"}
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
              <p className="text-3xl font-bold text-foreground">₹{totalExpenses.toFixed(0)}</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Transactions</p>
              <p className="text-3xl font-bold text-foreground">{expenses.length}</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Average</p>
              <p className="text-3xl font-bold text-foreground">
                ₹{expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(0) : 0}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border mb-8">
            <h2 className="font-bold text-lg text-foreground mb-4">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  type="number"
                  placeholder="Amount (₹)"
                  value={formData.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: e.target.value })}
                  step="0.01"
                  required
                  disabled={loading}
                />
                <select
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border bg-background disabled:opacity-50"
                  required
                  disabled={loading}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                <Plus size={16} className="mr-2" />
                {loading ? "Saving..." : editingId ? "Update Expense" : "Add Expense"}
              </Button>
            </form>
          </div>

          <div className="space-y-2">
            <h2 className="font-bold text-lg text-foreground mb-4">Recent Expenses</h2>
            {expenses.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No expenses yet. Add one to get started!</p>
            ) : (
              <div className="space-y-2">
                {[...expenses].reverse().map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-card rounded-lg p-4 border border-border flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{expense.description || expense.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category} • {expense.date}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-foreground mr-4">₹{expense.amount.toFixed(0)}</p>
                    <button
                      type="button"
                      onClick={() => handleEditExpense(expense)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      <Edit2 size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
