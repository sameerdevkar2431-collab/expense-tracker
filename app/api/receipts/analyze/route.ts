import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL required" }, { status: 400 })
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("[OCR] Missing OPENAI_API_KEY")
      return NextResponse.json(
        { error: "OCR service not configured" },
        { status: 503 }
      )
    }

    // Call OpenAI Vision API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
              {
                type: "text",
                text: "Extract receipt information: merchant name, date, items with prices, total amount, tax. Return as JSON.",
              },
            ],
          },
        ],
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[OCR] OpenAI error:", errorData)
      return NextResponse.json({ error: "Failed to analyze receipt" }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: "No analysis returned" }, { status: 500 })
    }

    // Parse JSON from response
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      // Try to extract JSON from text
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content }
    }

    return NextResponse.json({
      success: true,
      data: parsed,
      confidence: 0.9,
    })
  } catch (error) {
    console.error("[OCR] Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
