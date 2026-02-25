"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { storage } from "@/lib/storage"
import { parseReceipt, suggestCategories } from "@/lib/receipt-analysis"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ImageIcon, Zap, CheckCircle2, AlertCircle } from "lucide-react"

export default function ReceiptModule() {
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("mode") === "guest"
  const [receipts, setReceipts] = useState([])
  const [categories, setCategories] = useState([])
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveOptions, setSaveOptions] = useState({
    includeInReports: true,
    selectedCategory: "",
    manualAmount: "",
    manualMerchant: "",
    manualDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    const allTransactions = storage.getTransactions(false)
    setReceipts(allTransactions.filter((t) => t.receiptUrl))
    setCategories(storage.getCategories(false))
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      setUploadedImage(imageData)
      setAnalysis(null)
      setShowSaveDialog(false)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyzeReceipt = async () => {
    if (!uploadedImage) return
    setIsAnalyzing(true)

    // Simulate OCR extraction - in production, use Tesseract.js or server API
    const mockExtractedText =
      "Starbucks Coffee\nDate: 12/03/2025\nCafé Latte - 150\nCroissant - 80\nTax - 23\nTotal: 253"

    // Parse receipt
    const parseResult = parseReceipt(mockExtractedText)

    // Suggest categories based on merchant
    const suggestedCats = suggestCategories(parseResult.merchant, [])
    const topCategory = suggestedCats[0] || "Food"

    setAnalysis({
      ...parseResult,
      suggestedCategories: suggestedCats,
      selectedCategory: topCategory,
    })

    setSaveOptions((prev) => ({
      ...prev,
      selectedCategory: topCategory,
      manualAmount: parseResult.total.toString(),
      manualMerchant: parseResult.merchant,
      manualDate: parseResult.date || prev.manualDate,
    }))

    setIsAnalyzing(false)
  }

  const handleSaveReceipt = () => {
    if (!uploadedImage || !analysis) return

    const amount = Number.parseFloat(saveOptions.manualAmount) || analysis.total
    const category = saveOptions.selectedCategory || analysis.suggestedCategories[0]

    // Save as transaction
    const transaction = {
      type: "expense" as const,
      amount,
      category,
      description: `${saveOptions.manualMerchant} - Receipt uploaded`,
      date: saveOptions.manualDate,
      receiptUrl: uploadedImage,
    }

    storage.addTransaction(transaction, false)

    // Save analysis to reports if enabled
    if (saveOptions.includeInReports && analysis) {
      storage.addReceiptAnalysis(
        {
          date: saveOptions.manualDate,
          merchant: saveOptions.manualMerchant,
          parsedTotal: analysis.total,
          confidence: analysis.confidence,
          lineItems: analysis.lineItems,
          suggestedCategory: category,
          includeInReports: true,
          receiptUrl: uploadedImage,
        },
        false,
      )
    }

    setReceipts(storage.getTransactions(false).filter((t) => t.receiptUrl))
    resetForm()

    // Show signup banner for guests
    if (isGuest) {
      alert("Receipt saved! Want this saved across devices? Sign up to migrate your receipts.")
    }
  }

  const handleAddAnalysisToReports = () => {
    if (!analysis) return

    const amount = Number.parseFloat(saveOptions.manualAmount) || analysis.total
    const category = saveOptions.selectedCategory || analysis.suggestedCategories[0]

    storage.addReceiptAnalysis(
      {
        date: saveOptions.manualDate,
        merchant: saveOptions.manualMerchant,
        parsedTotal: amount,
        confidence: analysis.confidence,
        lineItems: analysis.lineItems,
        suggestedCategory: category,
        includeInReports: true,
        receiptUrl: uploadedImage,
      },
      false,
    )

    if (isGuest) {
      alert("Analysis added to reports! Sign up to save this permanently.")
    }

    resetForm()
  }

  const resetForm = () => {
    setUploadedImage("")
    setAnalysis(null)
    setShowSaveDialog(false)
    setSaveOptions({
      includeInReports: true,
      selectedCategory: "",
      manualAmount: "",
      manualMerchant: "",
      manualDate: new Date().toISOString().split("T")[0],
    })
  }

  const handleDeleteReceipt = (id: string) => {
    storage.deleteTransaction(id, false)
    setReceipts(storage.getTransactions(false).filter((t) => t.receiptUrl))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-8 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Receipt Upload & Analysis</h1>
          {isGuest && <p className="text-sm text-muted-foreground mb-6">Guest mode - data saved locally</p>}

          <div className="bg-card rounded-lg p-6 border border-border mb-8">
            <h2 className="font-bold text-lg text-foreground mb-4">Upload Receipt</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
              }}
              className="space-y-4"
            >
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="receipt-upload"
                  aria-label="Upload receipt image"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium text-foreground mb-1">Click to upload receipt</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                </label>
              </div>

              {uploadedImage && !analysis && (
                <>
                  <div className="relative rounded-lg overflow-hidden h-48">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Receipt preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    onClick={handleAnalyzeReceipt}
                    disabled={isAnalyzing}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Zap size={16} className="mr-2" />
                    {isAnalyzing ? "Analyzing..." : "Analyze Receipt"}
                  </Button>
                </>
              )}

              {/* Analysis Results */}
              {analysis && (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden h-40 mb-4">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Receipt preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Parsed Details */}
                  <div className="bg-secondary/10 rounded-lg p-4 border border-secondary">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Parsed Total</p>
                        <p className="text-3xl font-bold text-foreground">₹{analysis.total.toFixed(0)}</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-xs font-semibold text-primary">{analysis.confidence}% Confidence</span>
                      </div>
                    </div>

                    {/* Merchant and Date */}
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Merchant</p>
                        <p className="font-medium text-foreground">{analysis.merchant}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                        <p className="font-medium text-foreground">{analysis.date}</p>
                      </div>
                    </div>

                    {/* Line Items */}
                    {analysis.lineItems.length > 0 && (
                      <div className="bg-background rounded p-3 mb-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Parsed Line Items</p>
                        <div className="space-y-1">
                          {analysis.lineItems.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-foreground">{item.description}</span>
                              <span className="text-muted-foreground">₹{item.amount.toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category Suggestions */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Suggested Categories</p>
                      <div className="flex gap-2 flex-wrap">
                        {analysis.suggestedCategories.map((cat: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setSaveOptions({ ...saveOptions, selectedCategory: cat })}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              saveOptions.selectedCategory === cat
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                            aria-pressed={saveOptions.selectedCategory === cat}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Edit Fields */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <AlertCircle size={14} />
                      Edit before saving
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <Input
                        type="text"
                        placeholder="Merchant"
                        value={saveOptions.manualMerchant}
                        onChange={(e) => setSaveOptions({ ...saveOptions, manualMerchant: e.target.value })}
                        aria-label="Edit merchant name"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={saveOptions.manualAmount}
                        onChange={(e) => setSaveOptions({ ...saveOptions, manualAmount: e.target.value })}
                        step="0.01"
                        aria-label="Edit total amount"
                      />
                      <Input
                        type="date"
                        value={saveOptions.manualDate}
                        onChange={(e) => setSaveOptions({ ...saveOptions, manualDate: e.target.value })}
                        aria-label="Edit transaction date"
                      />
                      <select
                        value={saveOptions.selectedCategory}
                        onChange={(e) => setSaveOptions({ ...saveOptions, selectedCategory: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-border bg-background"
                        aria-label="Select category"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Include in Reports Toggle */}
                    <label className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        checked={saveOptions.includeInReports}
                        onChange={(e) => setSaveOptions({ ...saveOptions, includeInReports: e.target.checked })}
                        className="w-4 h-4"
                        aria-label="Include analysis in monthly reports"
                      />
                      <span className="text-sm font-medium text-foreground">Include analysis in monthly reports</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid md:grid-cols-2 gap-3">
                    <Button onClick={handleSaveReceipt} className="bg-primary hover:bg-primary/90 text-white">
                      <CheckCircle2 size={16} className="mr-2" />
                      Save Receipt
                    </Button>
                    <Button
                      onClick={handleAddAnalysisToReports}
                      variant="outline"
                      className="border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
                    >
                      Add Analysis to Reports
                    </Button>
                  </div>

                  <Button onClick={resetForm} variant="ghost" className="w-full">
                    Upload Another Receipt
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Saved Receipts */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-foreground">Saved Receipts</h2>
            {receipts.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No receipts yet. Upload one to get started!</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {receipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {receipt.receiptUrl && (
                      <img
                        src={receipt.receiptUrl || "/placeholder.svg"}
                        alt={`Receipt from ${receipt.category}`}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-foreground">₹{receipt.amount.toFixed(0)}</p>
                          <p className="text-sm text-muted-foreground">{receipt.category}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteReceipt(receipt.id)}
                          className="p-1 hover:bg-destructive/10 rounded"
                          aria-label={`Delete receipt ${receipt.id}`}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{receipt.date}</p>
                      {receipt.description && <p className="text-xs text-foreground mt-1">{receipt.description}</p>}
                    </div>
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
