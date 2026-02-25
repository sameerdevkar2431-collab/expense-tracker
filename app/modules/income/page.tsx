"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2, Plus } from "lucide-react"

export default function IncomeModule() {
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("mode") === "guest"
  const [incomes, setIncomes] = useState([])
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    setIncomes(storage.getTransactions(false).filter((t) => t.type === "income"))
    setCategories(storage.getCategories(false).filter((c) => c.type === "income"))
  }, [])

  const handleAddIncome = (e) => {
    e.preventDefault()
    if (!formData.amount || !formData.category) return

    if (editingId) {
      storage.updateTransaction(editingId, { ...formData, amount: Number.parseFloat(formData.amount) }, false)
      setEditingId(null)
    } else {
      storage.addTransaction({ ...formData, amount: Number.parseFloat(formData.amount), type: "income" }, false)
    }

    setFormData({ amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0] })
    setIncomes(storage.getTransactions(false).filter((t) => t.type === "income"))
  }

  const handleDeleteIncome = (id) => {
    storage.deleteTransaction(id, false)
    setIncomes(storage.getTransactions(false).filter((t) => t.type === "income"))
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
          {isGuest && <p className="text-sm text-muted-foreground mb-6">Guest mode - data saved locally</p>}

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
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border bg-background"
                  required
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
                />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                <Plus size={16} className="mr-2" />
                {editingId ? "Update Income" : "Add Income"}
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
                      onClick={() => handleEditIncome(income)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteIncome(income.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
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
