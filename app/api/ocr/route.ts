import { type NextRequest, NextResponse } from "next/server"

// This endpoint serves as a fallback when client-side Tesseract.js is unavailable
// In production, integrate with AWS Textract, Google Vision API, or similar

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // TODO: Integrate with real OCR service
    // Example with AWS Textract:
    // const textractClient = new TextractClient({ region: "us-east-1" })
    // const response = await textractClient.send(new DetectDocumentTextCommand({...}))

    // For now, return mock response to match client-side behavior
    const mockResponse = {
      extractedText: "Starbucks Coffee\nDate: 12/03/2025\nCafé Latte - 150\nCroissant - 80\nTax - 23\nTotal: 253",
      confidence: 85,
      success: true,
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error("OCR API error:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
