// Rule-based intent detection engine with regex and keyword matching

export type ChatIntent =
  | "add_expense"
  | "add_income"
  | "check_spending"
  | "create_goal"
  | "update_goal"
  | "show_reports"
  | "open_receipt"
  | "recurring_expense"
  | "show_budget"
  | "goal_status"
  | "ask_report"
  | "greeting"
  | "help"
  | "unknown"

export interface IntentResult {
  intent: ChatIntent
  confidence: number
  params?: {
    amount?: number
    category?: string
    description?: string
    date?: string
    goalName?: string
    goalAmount?: number
  }
}

// Pattern matching for various intents
const PATTERNS = {
  add_expense: [
    /add\s+(?:₹|rs|rs\.)\s*(\d+(?:\.\d{2})?)\s+(?:for\s+)?(.+?)(?:\s+(?:today|yesterday|on|at|to))?/i,
    /spent?\s+(?:₹|rs|rs\.)\s*(\d+(?:\.\d{2})?)\s+(?:on|for)\s+(.+?)(?:\s+(?:today|yesterday))?/i,
    /(?:₹|rs|rs\.)\s*(\d+(?:\.\d{2})?)\s+(?:on|for)\s+(.+?)(?:\s+(?:today|yesterday))?/i,
  ],
  add_income: [
    /add\s+(?:income|salary|earnings?)\s+(?:₹|rs|rs\.)\s*(\d+(?:\.\d{2})?)\s+(?:from\s+)?(.+?)/i,
    /earned?\s+(?:₹|rs|rs\.)\s*(\d+(?:\.\d{2})?)\s+(?:from|for)\s+(.+?)/i,
  ],
  check_spending: [
    /how\s+much\s+(?:did\s+)?i\s+spend\s+(?:on|at)?\s*(.+?)(?:\s+(?:this|last))?\s*(month|week|today)/i,
    /spending\s+on\s+(.+?)(?:\s+this\s+(month|week|year))?/i,
    /total\s+(?:expenses?|spending)\s+on\s+(.+?)(?:\s+(?:this\s+)?(month|week|year))?/i,
  ],
  create_goal: [
    /create\s+(?:a\s+)?(?:saving\s+)?goal\s+(?:named?|called?|for)?\s*(.+?)\s+(?:of\s+)?(?:₹|rs|rs\.)\s*(\d+(?:\.\d{2})?)/i,
    /(?:new|set\s+a)\s+(?:saving\s+)?goal\s+(?:for\s+)?(.+?)\s+(?:₹|rs|rs\.)\s*(\d+(?:\.\d{2})?)/i,
  ],
  update_goal: [
    /update\s+(?:my\s+)?goal\s+(.+?)\s+(?:to\s+)?(?:₹|rs|rs\.)\s*(\d+(?:\.\d{2})?)/i,
    /(?:add|contribute)\s+(?:₹|rs|rs\.)\s*(\d+(?:\.\d{2})?)\s+to\s+(?:goal|saving)\s+(.+?)/i,
  ],
  show_reports: [
    /show\s+(?:me\s+)?(?:my\s+)?reports?/i,
    /(?:analytics|analysis|expenses?\s+report|summary)/i,
    /breakdown\s+of\s+(?:my\s+)?expenses?/i,
  ],
  goal_status: [
    /(?:what\s+is\s+my|check\s+my|show\s+my)\s+(?:goal|saving)\s+(?:status|progress)?(?:\s+for\s+)?(.+?)?/i,
    /(?:goal|saving)\s+(?:status|progress)\s+(?:for\s+)?(.+?)?/i,
    /how\s+much\s+(?:have\s+)?i\s+saved\s+for\s+(.+?)?/i,
  ],
  open_receipt: [
    /(?:upload|add|scan|show\s+me)\s+(?:my\s+)?(?:receipt|bill|invoice)/i,
    /open\s+receipt\s+(?:uploader|upload)/i,
  ],
  recurring_expense: [
    /(?:set|add|create)\s+(?:a\s+)?recurring\s+(?:expense|payment)\s+(?:₹|rs|rs\.)\s*(\d+(?:\.\d{2})?)\s+(?:for|on)\s+(.+?)/i,
  ],
  show_budget: [/(?:show|check)\s+(?:my\s+)?budget/i, /budget\s+for\s+(.+?)(?:\s+this\s+month)?/i],
  ask_report: [
    /(?:generate|create|make)\s+(?:a\s+)?(?:custom\s+)?report/i,
    /(?:give\s+me|show\s+me)\s+(?:a\s+)?(?:detailed\s+)?report(?:\s+on)?/i,
    /(?:detailed\s+)?report(?:\s+for\s+)?(.+?)?/i,
  ],
  greeting: [/^(?:hi|hello|hey|greetings|namaste)/i],
  help: [/(?:help|what\s+can\s+you\s+do|commands?|guide)/i],
}

// Extract parameters from user input
function extractParams(input: string, intent: ChatIntent): IntentResult["params"] {
  const params: any = {}

  // Parse amounts (₹, Rs, Rs., or just numbers)
  const amountMatch = input.match(/(?:₹|rs\.?)\s*(\d+(?:\.\d{2})?)/i)
  if (amountMatch) {
    params.amount = Number.parseFloat(amountMatch[1])
  }

  // Parse dates
  const dateMatch = input.match(/(?:on|at)?\s*(today|tomorrow|yesterday|(\d{1,2})[-/](\d{1,2})(?:[-/](\d{4}))?)/i)
  if (dateMatch) {
    const dateStr = dateMatch[1]
    if (dateStr.toLowerCase() === "today") {
      params.date = new Date().toISOString().split("T")[0]
    } else if (dateStr.toLowerCase() === "yesterday") {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      params.date = yesterday.toISOString().split("T")[0]
    }
  }

  // Parse category/description based on intent
  if (intent === "add_expense" || intent === "add_income") {
    const categoryMatch = input.match(/(?:for|on|at)\s+(.+?)(?:\s+(?:at|today|yesterday|on|₹|rs))?$/i)
    if (categoryMatch) {
      params.description = categoryMatch[1].trim()
      params.category = categorizeDescription(categoryMatch[1])
    }
  }

  if (intent === "check_spending") {
    const categoryMatch = input.match(/(?:on|at)?\s*(.+?)(?:\s+(?:this|last|for))?\s*(month|week|year)?/i)
    if (categoryMatch) {
      params.category = categoryMatch[1].trim()
    }
  }

  if (intent === "create_goal" || intent === "update_goal") {
    const goalMatch = input.match(/(?:goal|target)?\s+(.+?)\s+(?:of|₹|rs\.?)/i)
    if (goalMatch) {
      params.goalName = goalMatch[1].trim()
    }
    if (amountMatch) {
      params.goalAmount = Number.parseFloat(amountMatch[1])
    }
  }

  if (intent === "goal_status") {
    const goalMatch = input.match(/(?:goal|saving)(?:\s+(?:status|progress))?\s+(?:for\s+)?(.+?)?$/i)
    if (goalMatch) {
      params.goalName = goalMatch[1]?.trim() || undefined
    }
  }

  if (intent === "ask_report") {
    const typeMatch = input.match(/(?:report|analysis)\s+(?:on|for|about)?\s+(.+?)?$/i)
    if (typeMatch) {
      params.description = typeMatch[1]?.trim() || "general"
    }
  }

  return params
}

// Auto-categorize based on keywords
function categorizeDescription(description: string): string {
  const lower = description.toLowerCase()

  if (/(coffee|food|lunch|dinner|breakfast|restaurant|cafe|pizza|burger|subway)/i.test(lower)) return "Food"
  if (/(uber|taxi|bus|train|gas|petrol|transport|metro|auto)/i.test(lower)) return "Transport"
  if (/(movie|game|entertainment|show|concert|fun)/i.test(lower)) return "Entertainment"
  if (/(grocery|vegetables|milk|butter|milk|fruit)/i.test(lower)) return "Food"
  if (/(electricity|water|internet|phone|utility|bill)/i.test(lower)) return "Utilities"
  if (/(shopping|clothes|shoes|dress|mall|store)/i.test(lower)) return "Shopping"
  if (/(medicine|doctor|health|hospital|pharmacy|clinic)/i.test(lower)) return "Health"
  if (/(salary|paycheck|wage|income)/i.test(lower)) return "Salary"

  return "Other"
}

// Main intent detection function
export function detectIntent(userInput: string): IntentResult {
  const input = userInput.trim().toLowerCase()

  // Check each intent pattern
  for (const [intent, patterns] of Object.entries(PATTERNS)) {
    for (const pattern of patterns as RegExp[]) {
      if (pattern.test(input)) {
        const params = extractParams(userInput, intent as ChatIntent)
        return {
          intent: intent as ChatIntent,
          confidence: 0.85,
          params,
        }
      }
    }
  }

  // Default to unknown intent
  return {
    intent: "unknown",
    confidence: 0,
  }
}
