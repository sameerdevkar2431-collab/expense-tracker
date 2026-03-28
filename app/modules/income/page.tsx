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

export default function IncomeModule() {
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("mode") === "guest"
  const { isLoggedIn } = useAuth()
  const [incomes, setIncomes] = useState([])
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

  useEffect(() => {
    const loadIncomes = async () => {
      try {
        setError("")
        if (isLoggedIn) {
          console.log("[v0] Loading income from Supabase")
          const response = await fetch("/api/transactions", {
            method: "GET",
            credentials: "include",
          })

          if (!response.ok) {
            if (response.status === 401) {
              setIncomes(storage.getTransactions(false).filter((t) => t.type === "income"))
            } else {
              setError("Failed to load income from server")
            }
            return
          }

          const data = await response.json()
          console.log("[v0] Fetched from Supabase:", data.transactions?.length || 0, "income records")
          setIncomes(data.transactions?.filter((t) => t.type === "income") || [])
        } else {
          console.log("[v0] Loading income from localStorage")
          setIncomes(storage.getTransactions(false).filter((t) => t.type === "income"))
        }
      } catch (err) {
        console.error("[v0] Error loading income:", err)
        setError("Failed to load income")
        setIncomes(storage.getTransactions(false).filter((t) => t.type === "income"))
      }
    }

    loadIncomes()
    setCategories(storage.getCategories(false).filter((c) => c.type === "income"))
  }, [isLoggedIn])

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category) return

    setLoading(true)
    setError("")

    try {
      const selectedCategory = categories.find((c) => c.name === formData.category)
      if (!selectedCategory) {
        setError("Please select a valid category")
        setLoading(false)
        return
      }

      const incomeData = {
        amount: Number.parseFloat(formData.amount),
        category_id: selectedCategory.id,
        description: formData.description,
        date: formData.date,
        type: "income",
      }

      if (isLoggedIn) {
        if (editingId) {
          console.log("[v0] Updating income in Supabase")
          const response = await fetch("/api/transactions", {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingId, ...incomeData }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("[v0] Update error:", errorData)
            setError(errorData.error || "Failed to update income")
            return
          }

          const data = await response.json()
          console.log("[v0] Updated income:", data.transaction?.id)
          setIncomes(incomes.map((t) => (t.id === editingId ? data.transaction : t)))
        } else {
          console.log("[v0] Creating income in Supabase")
          const response = await fetch("/api/transactions", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(incomeData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("[v0] Create error:", errorData)
            setError(errorData.error || "Failed to save income")
            return
          }

          const data = await response.json()
          console.log("[v0] Created income:", data.transaction?.id)
          setIncomes([data.transaction, ...incomes])
        }
      } else {
        if (editingId) {
          storage.updateTransaction(editingId, incomeData, false)
        } else {
          storage.addTransaction(incomeData, false)
        }
        setIncomes(storage.getTransactions(false).filter((t) => t.type === "income"))
      }

      setFormData({ amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0] })
      setEditingId(null)
    } catch (err) {
      console.error("[v0] Error saving income:", err)
      setError("Failed to save income. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteIncome = async (id: string) => {
    if (!confirm("Delete this income?")) return

    setLoading(true)
    setError("")

    try {
      if (isLoggedIn) {
        console.log("[v0] Deleting income from Supabase:", id)
        const response = await fetch(`/api/transactions?id=${id}`, {
          method: "DELETE",
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("[v0] Delete error:", errorData)
          setError("Failed to delete income")
          return
        }

        console.log("[v0] Deleted from Supabase")
        setIncomes(incomes.filter((t) => t.id !== id))
      } else {
        storage.deleteTransaction(id, false)
        setIncomes(storage.getTransactions(false).filter((t) => t.type === "income"))
      }
    } catch (err) {
      console.error("[v0] Error deleting income:", err)
      setError("Failed to delete income")
    } finally {
      setLoading(false)
    }
  }

  const handleEditIncome = (income) => {
    setFormData(income)
    setEditingId(income.id)
  }

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-8 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Income Tracker</h1>
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
              <p className="text-sm text-muted-foreground mb-2">Total Income</p>
              <p className="text-3xl font-bold text-green-600">₹{totalIncome.toFixed(0)}</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Sources</p>
              <p className="text-3xl font-bold text-foreground">{incomes.length}</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Average</p>
              <p className="text-3xl font-bold text-foreground">
                ₹{incomes.length > 0 ? (totalIncome / incomes.length).toFixed(0) : 0}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border mb-8">
            <h2 className="font-bold text-lg text-foreground mb-4">Add Income</h2>
            <form onSubmit={handleAddIncome} className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  type="number"
                  placeholder="Amount (₹)"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  step="0.01"
                  required
                  disabled={loading}
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border bg-background disabled:opacity-50"
                  required
                  disabled={loading}
                >
                  <option value="">Select Source</option>
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                <Plus size={16} className="mr-2" />
                {loading ? "Saving..." : editingId ? "Update Income" : "Add Income"}
              </Button>
            </form>
          </div>

          <div className="space-y-2">
            <h2 className="font-bold text-lg text-foreground mb-4">Income History</h2>
            {incomes.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No income recorded yet. Add one to get started!</p>
            ) : (
              <div className="space-y-2">
                {[...incomes].reverse().map((income) => (
                  <div
                    key={income.id}
                    className="bg-card rounded-lg p-4 border border-border flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{income.description || income.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {income.category} • {income.date}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600 mr-4">+₹{income.amount.toFixed(0)}</p>
                    <button
                      type="button"
                      onClick={() => handleEditIncome(income)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      <Edit2 size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteIncome(income.id)}
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
