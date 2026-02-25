// Client-side OCR using Tesseract.js with fallback to server API

export interface OCRResult {
  success: boolean
  text: string
  confidence: number
  error?: string
}

export async function analyzeImage(file: File): Promise<OCRResult> {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        text: "",
        confidence: 0,
        error: "File must be an image",
      }
    }

    // Try client-side Tesseract.js first
    try {
      return await analyzeTesseract(file)
    } catch (tesseractError) {
      console.warn("[v0] Tesseract.js not available, trying server fallback", tesseractError)
      return await analyzeViaAPI(file)
    }
  } catch (error) {
    console.error("[v0] OCR analysis failed:", error)
    return {
      success: false,
      text: "",
      confidence: 0,
      error: "Failed to analyze image",
    }
  }
}

// Client-side OCR using Tesseract.js
// Note: Requires <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5"></script> in HTML
async function analyzeTesseract(file: File): Promise<OCRResult> {
  return new Promise((resolve, reject) => {
    // Check if Tesseract is loaded in window
    if (typeof (window as any).Tesseract === "undefined") {
      reject(new Error("Tesseract.js not loaded"))
      return
    }

    const Tesseract = (window as any).Tesseract

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const imageData = e.target?.result as string
        const worker = await Tesseract.createWorker()

        const result = await worker.recognize(imageData)
        const confidence = (result.data.confidence as number) || 85

        await worker.terminate()

        resolve({
          success: confidence > 30,
          text: result.data.text || "",
          confidence,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

// Server-side OCR fallback
async function analyzeViaAPI(file: File): Promise<OCRResult> {
  try {
    const formData = new FormData()
    formData.append("image", file)

    const response = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    // If API returns mock JSON, use it
    return {
      success: true,
      text: data.extractedText || data.text || "",
      confidence: data.confidence || 80,
    }
  } catch (error) {
    console.error("[v0] Server OCR fallback failed:", error)
    return {
      success: false,
      text: "",
      confidence: 0,
      error: "Server OCR unavailable",
    }
  }
}
