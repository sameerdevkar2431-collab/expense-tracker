// Receipt analysis utilities for client-side OCR and parsing
// TODO: Integrate with server-side OCR services (Tesseract API, AWS Textract, Google Vision API) for production

interface ParsedLineItem {
  description: string
  amount: number
}

interface ReceiptParseResult {
  merchant?: string
  date?: string
  lineItems: ParsedLineItem[]
  total: number
  confidence: number
}

// Mock OCR - extracts numbers and patterns from receipt text
// TODO: Replace with Tesseract.js or server OCR implementation
function extractTextFromImage(imageData: string): string {
  // In production, use:
  // - Tesseract.js for client-side OCR
  // - AWS Textract, Google Vision API, or similar for server-side
  // For now, return mock extracted text
  return "Starbucks Coffee\nDate: 12/03/2025\nCoffee - 120\nMuffin - 80\nTax - 20\nTotal: 220"
}

// Parse receipt text to extract merchant, date, line items, and total
export function parseReceipt(extractedText: string): ReceiptParseResult {
  const lines = extractedText.split("\n").filter((l) => l.trim())

  // Regex patterns for currency and numbers
  const currencyPattern = /[₹Rs]*\s*(\d+(?:\.\d{2})?)/g
  const datePattern = /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})|(\d{4})[/-](\d{1,2})[/-](\d{1,2})/

  let merchant = ""
  let date = ""
  const lineItems: ParsedLineItem[] = []
  let total = 0
  let foundTotal = false

  // First line is usually merchant name
  if (lines.length > 0 && !lines[0].match(/\d/)) {
    merchant = lines[0].trim()
  }

  // Extract date
  const dateMatch = extractedText.match(datePattern)
  if (dateMatch) {
    date = dateMatch[0]
  }

  // Extract amounts and build line items
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const amountMatch = line.match(currencyPattern)

    if (amountMatch) {
      const amount = Number.parseFloat(amountMatch[amountMatch.length - 1])

      // Check if this is likely the total (usually higher, at end, or after "Total")
      if (
        line.toLowerCase().includes("total") ||
        line.toLowerCase().includes("amount") ||
        (i === lines.length - 1 && amount > 50)
      ) {
        total = amount
        foundTotal = true
      } else if (!foundTotal && amount > 0) {
        lineItems.push({
          description: line.replace(currencyPattern, "").trim() || `Item ${lineItems.length + 1}`,
          amount,
        })
      }
    }
  }

  // If no total found, sum line items
  if (!foundTotal && lineItems.length > 0) {
    total = lineItems.reduce((sum, item) => sum + item.amount, 0)
  }

  // Calculate confidence (0-100)
  let confidence = 50 // base confidence
  if (merchant) confidence += 10
  if (date) confidence += 10
  if (total > 0) confidence += 15
  if (lineItems.length > 0) confidence += 15

  return {
    merchant: merchant || "Unknown",
    date: date || new Date().toISOString().split("T")[0],
    lineItems,
    total: total || 0,
    confidence: Math.min(100, confidence),
  }
}

// Suggest categories based on merchant name and keywords
export function suggestCategories(merchant: string, keywords: string[]): string[] {
  const merchantLower = merchant.toLowerCase()
  const keywordsLower = keywords.map((k) => k.toLowerCase())

  const categoryKeywords: Record<string, string[]> = {
    Food: [
      "food",
      "restaurant",
      "cafe",
      "coffee",
      "pizza",
      "burger",
      "subway",
      "starbucks",
      "groceries",
      "supermarket",
    ],
    Transport: ["uber", "taxi", "gas", "petrol", "auto", "bus", "train", "metro"],
    Entertainment: ["movie", "theater", "game", "netflix", "spotify", "gaming"],
    Shopping: ["mall", "store", "amazon", "flipkart", "shop", "retail"],
    Utilities: ["electric", "water", "internet", "phone", "bill"],
    Health: ["medical", "doctor", "pharmacy", "hospital", "clinic", "health"],
  }

  const matches: Record<string, number> = {}

  for (const [category, words] of Object.entries(categoryKeywords)) {
    let score = 0
    for (const word of words) {
      if (merchantLower.includes(word)) score += 2
      if (keywordsLower.some((k) => k.includes(word))) score += 1
    }
    if (score > 0) matches[category] = score
  }

  // Return top 3 categories by score, default to Food if no matches
  const sorted = Object.entries(matches).sort(([, a], [, b]) => b - a)
  return sorted.slice(0, 3).map(([cat]) => cat) || ["Food"]
}

export function migrateReceiptAnalysisOnSignup(isLoggedIn: boolean) {
  // Called when user signs up to migrate guest receipt analyses
  const guestKey = "sshub:guest:receipt-analyses"
  const userKey = "sshub:user:receipt-analyses"
  const guestData = localStorage.getItem(guestKey)
  if (guestData) {
    localStorage.setItem(userKey, guestData)
  }
}
