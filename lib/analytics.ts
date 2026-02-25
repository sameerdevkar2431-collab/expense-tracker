interface TransactionData {
  id: string
  type: "expense" | "income"
  amount: number
  category: string
  description: string
  date: string
  recurring?: boolean
  receiptUrl?: string
}

interface BudgetData {
  category: string
  limit: number
  month: string
}

export const analytics = {
  getTotalExpenses: (transactions: TransactionData[], month?: string) => {
    return transactions
      .filter((t) => {
        if (t.type !== "expense") return false
        if (!month) return true
        return t.date.startsWith(month)
      })
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getTotalIncome: (transactions: TransactionData[], month?: string) => {
    return transactions
      .filter((t) => {
        if (t.type !== "income") return false
        if (!month) return true
        return t.date.startsWith(month)
      })
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getExpensesByCategory: (transactions: TransactionData[], month?: string) => {
    const expenses: Record<string, number> = {}
    transactions
      .filter((t) => {
        if (t.type !== "expense") return false
        if (!month) return true
        return t.date.startsWith(month)
      })
      .forEach((t) => {
        expenses[t.category] = (expenses[t.category] || 0) + t.amount
      })
    return expenses
  },

  getMonthlyData: (transactions: TransactionData[]) => {
    const monthlyData: Record<string, { income: number; expense: number }> = {}
    transactions.forEach((t) => {
      const month = t.date.substring(0, 7)
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 }
      if (t.type === "income") monthlyData[month].income += t.amount
      else monthlyData[month].expense += t.amount
    })
    return monthlyData
  },

  getBudgetStatus: (transactions: TransactionData[], budgets: BudgetData[]) => {
    const currentMonth = new Date().toISOString().substring(0, 7)
    const monthlyExpenses = analytics.getExpensesByCategory(transactions.filter((t) => t.date.startsWith(currentMonth)))

    return budgets.map((budget) => ({
      ...budget,
      spent: monthlyExpenses[budget.category] || 0,
      remaining: budget.limit - (monthlyExpenses[budget.category] || 0),
      percentage: Math.min(100, ((monthlyExpenses[budget.category] || 0) / budget.limit) * 100),
    }))
  },
}
