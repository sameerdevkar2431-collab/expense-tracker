"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2, Plus } from "lucide-react"

export default function SavingJarModule() {
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("mode") === "guest"
  const [goals, setGoals] = useState([])
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "", currentAmount: "", deadline: "" })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    setGoals(storage.getSavingGoals(false))
  }, [])

  const handleAddGoal = (e) => {
    e.preventDefault()
    if (!newGoal.name || !newGoal.targetAmount) return

    if (editingId) {
      storage.updateSavingGoal(
        editingId,
        {
          ...newGoal,
          targetAmount: Number.parseFloat(newGoal.targetAmount),
          currentAmount: Number.parseFloat(newGoal.currentAmount),
        },
        false,
      )
      setEditingId(null)
    } else {
      storage.addSavingGoal(
        {
          ...newGoal,
          targetAmount: Number.parseFloat(newGoal.targetAmount),
          currentAmount: Number.parseFloat(newGoal.currentAmount),
        },
        false,
      )
    }

    setNewGoal({ name: "", targetAmount: "", currentAmount: "", deadline: "" })
    setGoals(storage.getSavingGoals(false))
  }

  const handleDeleteGoal = (id) => {
    storage.deleteSavingGoal(id, false)
    setGoals(storage.getSavingGoals(false))
  }

  const handleEditGoal = (goal) => {
    setNewGoal(goal)
    setEditingId(goal.id)
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-8 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Smart Saving Jar</h1>
          {isGuest && <p className="text-sm text-muted-foreground mb-6">Guest mode - data saved locally</p>}

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Total Saved</p>
              <p className="text-3xl font-bold text-green-600">₹{totalSaved.toFixed(0)}</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Total Target</p>
              <p className="text-3xl font-bold text-foreground">₹{totalTarget.toFixed(0)}</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Progress</p>
              <p className="text-3xl font-bold text-primary">
                {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border mb-8">
            <h2 className="font-bold text-lg text-foreground mb-4">Add Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  type="text"
                  placeholder="Goal Name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Target Amount (₹)"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  step="0.01"
                  required
                />
                <Input
                  type="number"
                  placeholder="Current Saved (₹)"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                  step="0.01"
                />
                <Input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                <Plus size={16} className="mr-2" />
                {editingId ? "Update Goal" : "Add Goal"}
              </Button>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-lg text-foreground">Your Goals</h2>
            {goals.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No goals yet. Start saving towards your dreams!</p>
            ) : (
              goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                return (
                  <div key={goal.id} className="bg-card rounded-lg p-6 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-foreground">{goal.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{goal.currentAmount.toFixed(0)} of ₹{goal.targetAmount.toFixed(0)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditGoal(goal)} className="p-2 hover:bg-muted rounded-lg">
                          <Edit2 size={16} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{progress.toFixed(0)}% Complete</span>
                      {goal.deadline && <span>Due: {goal.deadline}</span>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
