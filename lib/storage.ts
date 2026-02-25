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

interface SavingGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
  type: "expense" | "income"
}

interface ReceiptAnalysis {
  id: string
  date: string
  merchant?: string
  parsedTotal: number
  confidence: number
  lineItems: Array<{ description: string; amount: number }>
  suggestedCategory: string
  includeInReports: boolean
  receiptUrl?: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  intent?: string
  action?: string
}

const GUEST_PREFIX = "sshub:guest:"
const USER_PREFIX = "sshub:user:"

export const storage = {
  // Get prefix based on auth state
  getPrefix: (isLoggedIn: boolean) => (isLoggedIn ? USER_PREFIX : GUEST_PREFIX),

  // Transactions
  getTransactions: (isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const data = localStorage.getItem(`${prefix}transactions`)
    return data ? JSON.parse(data) : []
  },

  addTransaction: (transaction: Omit<TransactionData, "id">, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const transactions = storage.getTransactions(isLoggedIn)
    const newTransaction = { ...transaction, id: Date.now().toString() }
    transactions.push(newTransaction)
    localStorage.setItem(`${prefix}transactions`, JSON.stringify(transactions))
    return newTransaction
  },

  updateTransaction: (id: string, updates: Partial<TransactionData>, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const transactions = storage.getTransactions(isLoggedIn)
    const index = transactions.findIndex((t: TransactionData) => t.id === id)
    if (index > -1) {
      transactions[index] = { ...transactions[index], ...updates }
      localStorage.setItem(`${prefix}transactions`, JSON.stringify(transactions))
    }
  },

  deleteTransaction: (id: string, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const transactions = storage.getTransactions(isLoggedIn)
    const filtered = transactions.filter((t: TransactionData) => t.id !== id)
    localStorage.setItem(`${prefix}transactions`, JSON.stringify(filtered))
  },

  // Budgets
  getBudgets: (isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const data = localStorage.getItem(`${prefix}budgets`)
    return data ? JSON.parse(data) : []
  },

  setBudgets: (budgets: BudgetData[], isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    localStorage.setItem(`${prefix}budgets`, JSON.stringify(budgets))
  },

  // Saving Goals
  getSavingGoals: (isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const data = localStorage.getItem(`${prefix}saving-goals`)
    return data ? JSON.parse(data) : []
  },

  addSavingGoal: (goal: Omit<SavingGoal, "id">, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const goals = storage.getSavingGoals(isLoggedIn)
    const newGoal = { ...goal, id: Date.now().toString() }
    goals.push(newGoal)
    localStorage.setItem(`${prefix}saving-goals`, JSON.stringify(goals))
    return newGoal
  },

  updateSavingGoal: (id: string, updates: Partial<SavingGoal>, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const goals = storage.getSavingGoals(isLoggedIn)
    const index = goals.findIndex((g: SavingGoal) => g.id === id)
    if (index > -1) {
      goals[index] = { ...goals[index], ...updates }
      localStorage.setItem(`${prefix}saving-goals`, JSON.stringify(goals))
    }
  },

  deleteSavingGoal: (id: string, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const goals = storage.getSavingGoals(isLoggedIn)
    const filtered = goals.filter((g: SavingGoal) => g.id !== id)
    localStorage.setItem(`${prefix}saving-goals`, JSON.stringify(filtered))
  },

  // Categories
  getCategories: (isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const categories = localStorage.getItem(`${prefix}categories`)
    if (!categories) {
      const defaults = storage.getDefaultCategories()
      localStorage.setItem(`${prefix}categories`, JSON.stringify(defaults))
      return defaults
    }
    return JSON.parse(categories)
  },

  getDefaultCategories: (): Category[] => [
    { id: "1", name: "Food", color: "#FF6B6B", icon: "🍔", type: "expense" },
    { id: "2", name: "Transport", color: "#4ECDC4", icon: "🚗", type: "expense" },
    { id: "3", name: "Entertainment", color: "#FFE66D", icon: "🎮", type: "expense" },
    { id: "4", name: "Utilities", color: "#95E1D3", icon: "💡", type: "expense" },
    { id: "5", name: "Shopping", color: "#F38181", icon: "🛍️", type: "expense" },
    { id: "6", name: "Health", color: "#AA96DA", icon: "🏥", type: "expense" },
    { id: "7", name: "Salary", color: "#0FB8B3", icon: "💼", type: "income" },
    { id: "8", name: "Freelance", color: "#2563EB", icon: "💻", type: "income" },
  ],

  addCategory: (category: Omit<Category, "id">, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const categories = storage.getCategories(isLoggedIn)
    const newCategory = { ...category, id: Date.now().toString() }
    categories.push(newCategory)
    localStorage.setItem(`${prefix}categories`, JSON.stringify(categories))
    return newCategory
  },

  updateCategory: (id: string, updates: Partial<Category>, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const categories = storage.getCategories(isLoggedIn)
    const index = categories.findIndex((c: Category) => c.id === id)
    if (index > -1) {
      categories[index] = { ...categories[index], ...updates }
      localStorage.setItem(`${prefix}categories`, JSON.stringify(categories))
    }
  },

  deleteCategory: (id: string, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const categories = storage.getCategories(isLoggedIn)
    const filtered = categories.filter((c: Category) => c.id !== id)
    localStorage.setItem(`${prefix}categories`, JSON.stringify(filtered))
  },

  // Auth
  getUser: () => {
    const user = localStorage.getItem("sshub:user")
    return user ? JSON.parse(user) : null
  },

  setUser: (user: { id: string; email: string; name: string }) => {
    localStorage.setItem("sshub:user", JSON.stringify(user))
  },

  logout: () => {
    localStorage.removeItem("sshub:user")
  },

  // Export/Import
  exportData: (isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    return {
      transactions: storage.getTransactions(isLoggedIn),
      budgets: storage.getBudgets(isLoggedIn),
      savingGoals: storage.getSavingGoals(isLoggedIn),
      categories: storage.getCategories(isLoggedIn),
      receiptAnalyses: storage.getReceiptAnalyses(isLoggedIn),
      chatHistory: storage.getChatHistory(isLoggedIn),
      exportDate: new Date().toISOString(),
    }
  },

  importData: (data: any, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    if (data.transactions) localStorage.setItem(`${prefix}transactions`, JSON.stringify(data.transactions))
    if (data.budgets) localStorage.setItem(`${prefix}budgets`, JSON.stringify(data.budgets))
    if (data.savingGoals) localStorage.setItem(`${prefix}saving-goals`, JSON.stringify(data.savingGoals))
    if (data.categories) localStorage.setItem(`${prefix}categories`, JSON.stringify(data.categories))
    if (data.receiptAnalyses) localStorage.setItem(`${prefix}receipt-analyses`, JSON.stringify(data.receiptAnalyses))
    if (data.chatHistory) localStorage.setItem(`${prefix}chat-history`, JSON.stringify(data.chatHistory))
  },

  // Migrate guest data to user data
  migrateGuestToUser: () => {
    const guestTransactions = storage.getTransactions(false)
    const guestBudgets = storage.getBudgets(false)
    const guestGoals = storage.getSavingGoals(false)
    const guestCategories = storage.getCategories(false)
    const guestAnalyses = storage.getReceiptAnalyses(false)
    const guestChatHistory = storage.getChatHistory(false)

    if (guestTransactions.length > 0)
      localStorage.setItem(`${USER_PREFIX}transactions`, JSON.stringify(guestTransactions))
    if (guestBudgets.length > 0) localStorage.setItem(`${USER_PREFIX}budgets`, JSON.stringify(guestBudgets))
    if (guestGoals.length > 0) localStorage.setItem(`${USER_PREFIX}saving-goals`, JSON.stringify(guestGoals))
    if (guestCategories.length > 0) localStorage.setItem(`${USER_PREFIX}categories`, JSON.stringify(guestCategories))
    if (guestAnalyses.length > 0) localStorage.setItem(`${USER_PREFIX}receipt-analyses`, JSON.stringify(guestAnalyses))
    if (guestChatHistory.length > 0)
      localStorage.setItem(`${USER_PREFIX}chat-history`, JSON.stringify(guestChatHistory))
  },

  // Receipt Analyses
  getReceiptAnalyses: (isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const data = localStorage.getItem(`${prefix}receipt-analyses`)
    return data ? JSON.parse(data) : []
  },

  addReceiptAnalysis: (analysis: Omit<ReceiptAnalysis, "id">, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const analyses = storage.getReceiptAnalyses(isLoggedIn)
    const newAnalysis = { ...analysis, id: Date.now().toString() }
    analyses.push(newAnalysis)
    localStorage.setItem(`${prefix}receipt-analyses`, JSON.stringify(analyses))
    return newAnalysis
  },

  deleteReceiptAnalysis: (id: string, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const analyses = storage.getReceiptAnalyses(isLoggedIn)
    const filtered = analyses.filter((a: ReceiptAnalysis) => a.id !== id)
    localStorage.setItem(`${prefix}receipt-analyses`, JSON.stringify(filtered))
  },

  // Chat History
  getChatHistory: (isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const data = localStorage.getItem(`${prefix}chat-history`)
    return data ? JSON.parse(data) : []
  },

  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">, isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    const history = storage.getChatHistory(isLoggedIn)
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    }
    history.push(newMessage)
    localStorage.setItem(`${prefix}chat-history`, JSON.stringify(history))
    return newMessage
  },

  clearChatHistory: (isLoggedIn: boolean) => {
    const prefix = storage.getPrefix(isLoggedIn)
    localStorage.removeItem(`${prefix}chat-history`)
  },
}
