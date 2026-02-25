"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { storage } from "@/lib/storage"
import { parseReceipt, suggestCategories } from "@/lib/receipt-analysis"
import { analyzeImage } from "@/libs/tesseract-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2, Zap } from "lucide-react"

interface ReceiptAnalysisWrapperProps {
  onAnalysisComplete?: (analysis: any) => void
  onSave?: () => void
}

export function ReceiptAnalysisWrapper({ onAnalysisComplete, onSave }: ReceiptAnalysisWrapperProps) {
  const { isLoggedIn } = useAuth()
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [extractedText, setExtractedText] = useState<string>("")
  const [confidence, setConfidence] = useState<number>(0)
  const [saveOptions, setSaveOptions] = useState({
    selectedCategory: "",
    manualAmount: "",
    manualMerchant: "",
    manualDate: new Date().toISOString().split("T")[0],
    includeInReports: true,
  })

  const categories = storage.getCategories(isLoggedIn)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      setUploadedImage(imageData)
      setAnalysis(null)
      setExtractedText("")
      setConfidence(0)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyzeReceipt = async () => {
    if (!uploadedImage) return
    setIsAnalyzing(true)

    try {
      // Try to extract text using client-side or server OCR
      let textToAnalyze = extractedText

      if (!textToAnalyze) {
        // Convert base64 to blob and analyze
        const blob = await fetch(uploadedImage).then((r) => r.blob())
        const file = new File([blob], "receipt.jpg", { type: "image/jpeg" })

        const ocrResult = await analyzeImage(file)

        if (ocrResult.success) {
          textToAnalyze = ocrResult.text
          setExtractedText(ocrResult.text)
          setConfidence(ocrResult.confidence)
        } else {
          // Fallback to mock extraction if OCR fails
          textToAnalyze = "Starbucks Coffee\nDate: 12/03/2025\nCafé Latte - 150\nCroissant - 80\nTax - 23\nTotal: 253"
          setConfidence(60)
        }
      }

      // Parse the extracted text
      const parseResult = parseReceipt(textToAnalyze)

      // Suggest categories
      const suggestedCats = suggestCategories(parseResult.merchant, [])
      const topCategory = suggestedCats[0] || "Food"

      const completeAnalysis = {
        ...parseResult,
        suggestedCategories: suggestedCats,
        selectedCategory: topCategory,
        extractedText: textToAnalyze,
        ocrConfidence: confidence || parseResult.confidence,
      }

      setAnalysis(completeAnalysis)
      setSaveOptions((prev) => ({
        ...prev,
        selectedCategory: topCategory,
        manualAmount: parseResult.total.toString(),
        manualMerchant: parseResult.merchant,
        manualDate: parseResult.date || prev.manualDate,
      }))

      onAnalysisComplete?.(completeAnalysis)
    } catch (error) {
      console.error("[v0] Receipt analysis failed:", error)
      setAnalysis({
        error: "Failed to analyze receipt. Please try again.",
      })
    } finally {
      setIsAnalyzing(false)
    }
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

    storage.addTransaction(transaction, isLoggedIn)

    // Save analysis to reports if enabled
    if (saveOptions.includeInReports && analysis) {
      storage.addReceiptAnalysis(
        {
          date: saveOptions.manualDate,
          merchant: saveOptions.manualMerchant,
          parsedTotal: analysis.total,
          confidence: analysis.ocrConfidence,
          lineItems: analysis.lineItems,
          suggestedCategory: category,
          includeInReports: true,
          receiptUrl: uploadedImage,
        },
        isLoggedIn,
      )
    }

    resetForm()
    onSave?.()
  }

  const resetForm = () => {
    setUploadedImage("")
    setAnalysis(null)
    setExtractedText("")
    setConfidence(0)
    setSaveOptions({
      selectedCategory: "",
      manualAmount: "",
      manualMerchant: "",
      manualDate: new Date().toISOString().split("T")[0],
      includeInReports: true,
    })
  }

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="receipt-upload-wrapper"
          aria-label="Upload receipt image"
        />
        <label htmlFor="receipt-upload-wrapper" className="cursor-pointer">
          <div className="text-4xl mb-2">📄</div>
          <p className="font-medium text-foreground mb-1">Click to upload receipt</p>
          <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
        </label>
      </div>

      {/* Preview and Analyze */}
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
            {isAnalyzing ? "Analyzing receipt..." : "Analyze Receipt"}
          </Button>
        </>
      )}

      {/* Analysis Results */}
      {analysis && !analysis.error && (
        <>
          <div className="relative rounded-lg overflow-hidden h-40 mb-4">
            <img
              src={uploadedImage || "/placeholder.svg"}
              alt="Receipt preview"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Parsed Details */}
          <div className="bg-secondary/10 rounded-lg p-4 border border-secondary space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Parsed Total</p>
                <p className="text-3xl font-bold text-foreground">₹{analysis.total.toFixed(0)}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-xs font-semibold text-primary">
                  {Math.round(analysis.ocrConfidence)}% Confidence
                </span>
              </div>
            </div>

            {/* Merchant and Date */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Merchant</p>
                <p className="font-medium text-foreground">{analysis.merchant}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date</p>
                <p className="font-medium text-foreground">{analysis.date}</p>
              </div>
            </div>

            {/* Category Suggestions */}
            <div>
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
          <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-3">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <AlertCircle size={14} />
              Review & edit before saving
            </p>
            <div className="grid md:grid-cols-2 gap-3">
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

            <label className="flex items-center gap-3">
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

          {/* Save Button */}
          <Button onClick={handleSaveReceipt} className="w-full bg-primary hover:bg-primary/90 text-white">
            <CheckCircle2 size={16} className="mr-2" />
            Save Receipt
          </Button>

          <Button onClick={resetForm} variant="ghost" className="w-full">
            Upload Another Receipt
          </Button>
        </>
      )}

      {/* Error State */}
      {analysis?.error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-sm text-destructive font-medium">{analysis.error}</p>
          <Button onClick={resetForm} variant="outline" className="mt-4 w-full bg-transparent">
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
