"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { storage } from "@/lib/storage"
import { analytics } from "@/lib/analytics"

export default function ReportsModule() {
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("mode") === "guest"
  const [transactions, setTransactions] = useState([])
  const [monthlyData, setMonthlyData] = useState({})
  const [categoryData, setCategoryData] = useState({})

  useEffect(() => {
    const trans = storage.getTransactions(false)
    setTransactions(trans)
    setMonthlyData(analytics.getMonthlyData(trans))
    setCategoryData(analytics.getExpensesByCategory(trans))
  }, [])

  const currentMonth = new Date().toISOString().substring(0, 7)
  const monthlyIncome = analytics.getTotalIncome(transactions, currentMonth)
  const monthlyExpenses = analytics.getTotalExpenses(transactions, currentMonth)
  const savingsRate = monthlyIncome > 0 ? (((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-8 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
          {isGuest && <p className="text-sm text-muted-foreground mb-6">Guest mode - data saved locally</p>}

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">This Month Income</p>
              <p className="text-3xl font-bold text-green-600">₹{monthlyIncome.toFixed(0)}</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">This Month Expenses</p>
              <p className="text-3xl font-bold text-red-600">₹{monthlyExpenses.toFixed(0)}</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Net Savings</p>
              <p className="text-3xl font-bold text-blue-600">₹{(monthlyIncome - monthlyExpenses).toFixed(0)}</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Savings Rate</p>
              <p className="text-3xl font-bold text-primary">{savingsRate}%</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="font-bold text-lg text-foreground mb-4">Category Breakdown</h2>
              {Object.keys(categoryData).length === 0 ? (
                <p className="text-muted-foreground">No data available</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(categoryData).map(([category, amount]) => {
                    const percentage = ((amount / monthlyExpenses) * 100).toFixed(1)
                    return (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm font-bold">₹{amount.toFixed(0)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="font-bold text-lg text-foreground mb-4">Monthly Trend</h2>
              {Object.keys(monthlyData).length === 0 ? (
                <p className="text-muted-foreground">No data available</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(monthlyData)
                    .sort()
                    .reverse()
                    .slice(0, 6)
                    .map(([month, data]) => (
                      <div key={month}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{month}</span>
                          <span className="text-xs text-green-600">+₹{data.income.toFixed(0)}</span>
                          <span className="text-xs text-red-600">-₹{data.expense.toFixed(0)}</span>
                        </div>
                        <div className="flex gap-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="bg-green-500"
                            style={{ width: `${Math.min(50, (data.income / (data.income + data.expense)) * 100)}%` }}
                          />
                          <div
                            className="bg-red-500"
                            style={{ width: `${Math.min(50, (data.expense / (data.income + data.expense)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="font-bold text-lg text-foreground mb-4">Transaction Summary</h2>
            <p className="text-sm text-muted-foreground mb-4">Total transactions: {transactions.length}</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-muted-foreground">No transactions yet</p>
              ) : (
                [...transactions]
                  .reverse()
                  .slice(0, 20)
                  .map((trans) => (
                    <div
                      key={trans.id}
                      className="flex justify-between items-center py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm">{trans.description || trans.category}</p>
                        <p className="text-xs text-muted-foreground">{trans.date}</p>
                      </div>
                      <p
                        className={`font-semibold text-sm ${trans.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {trans.type === "income" ? "+" : "-"}₹{trans.amount.toFixed(0)}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
