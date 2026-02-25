"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2, Plus } from "lucide-react"

const ICONS = ["🍔", "🚗", "🎮", "💡", "🛍️", "🏥", "💼", "💻", "🎓", "⚽", "🏡", "✈️"]
const COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181", "#AA96DA", "#0FB8B3", "#2563EB"]

export default function CategoriesModule() {
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("mode") === "guest"
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({ name: "", color: "", icon: "", type: "expense" })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    setCategories(storage.getCategories(false))
  }, [])

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.color || !formData.icon) return

    if (editingId) {
      storage.updateCategory(editingId, formData, false)
      setEditingId(null)
    } else {
      storage.addCategory(formData, false)
    }

    setFormData({ name: "", color: "", icon: "", type: "expense" })
    setCategories(storage.getCategories(false))
  }

  const handleDeleteCategory = (id) => {
    storage.deleteCategory(id, false)
    setCategories(storage.getCategories(false))
  }

  const handleEditCategory = (category) => {
    setFormData(category)
    setEditingId(category.id)
  }

  const expenseCategories = categories.filter((c) => c.type === "expense")
  const incomeCategories = categories.filter((c) => c.type === "income")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-8 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Categories Manager</h1>
          {isGuest && <p className="text-sm text-muted-foreground mb-6">Guest mode - data saved locally</p>}

          <div className="bg-card rounded-lg p-6 border border-border mb-8">
            <h2 className="font-bold text-lg text-foreground mb-4">Create Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Category Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-3 rounded-lg border-2 text-xl transition-all ${formData.icon === icon ? "border-primary bg-primary/10" : "border-border"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`p-4 rounded-lg border-2 transition-all ${formData.color === color ? "border-black dark:border-white scale-110" : "border-border"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                <Plus size={16} className="mr-2" />
                {editingId ? "Update Category" : "Create Category"}
              </Button>
            </form>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="font-bold text-lg text-foreground mb-4">
                Expense Categories ({expenseCategories.length})
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {expenseCategories.length === 0 ? (
                  <p className="text-muted-foreground">No expense categories</p>
                ) : (
                  expenseCategories.map((cat) => (
                    <div key={cat.id} className="bg-card rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleEditCategory(cat)} className="p-1 hover:bg-muted rounded">
                            <Edit2 size={14} className="text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 hover:bg-destructive/10 rounded"
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </button>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">{cat.name}</p>
                      <div className="mt-2 w-full h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="font-bold text-lg text-foreground mb-4">Income Categories ({incomeCategories.length})</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {incomeCategories.length === 0 ? (
                  <p className="text-muted-foreground">No income categories</p>
                ) : (
                  incomeCategories.map((cat) => (
                    <div key={cat.id} className="bg-card rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleEditCategory(cat)} className="p-1 hover:bg-muted rounded">
                            <Edit2 size={14} className="text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 hover:bg-destructive/10 rounded"
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </button>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">{cat.name}</p>
                      <div className="mt-2 w-full h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
