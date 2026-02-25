import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/transactions - Starting")
    const supabase = createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth check:", { hasUser: !!user, authError: authError?.message })

    if (authError || !user) {
      console.log("[v0] Unauthorized - no user session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's transactions
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) {
      console.error("[v0] [Transactions] Fetch error:", {
        code: error.code,
        message: error.message,
        details: error.details,
      })
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    console.log("[v0] Successfully fetched", data?.length || 0, "transactions")
    return NextResponse.json({ transactions: data || [] })
  } catch (error) {
    console.error("[v0] [Transactions] Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/transactions - Starting")
    const supabase = createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth check:", { hasUser: !!user, userId: user?.id, authError: authError?.message })

    if (authError || !user) {
      console.log("[v0] Unauthorized - no user session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { amount, category, description, date, type } = body

    // Validate required fields
    if (!amount || !category || !date || !type) {
      console.log("[v0] Validation failed - missing fields:", {
        amount: !!amount,
        category: !!category,
        date: !!date,
        type: !!type,
      })
      return NextResponse.json(
        { error: "Missing required fields: amount, category, date, type" },
        { status: 400 }
      )
    }

    // Validate amount is a number
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    // Validate type
    if (!["expense", "income"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'expense' or 'income'" }, { status: 400 })
    }

    console.log("[v0] Inserting transaction for user:", user.id, {
      amount,
      category,
      type,
      date,
    })

    // Insert transaction with user_id set by RLS
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: parseFloat(amount.toString()),
        category: category.toString(),
        description: description ? description.toString() : null,
        date: date.toString(),
        type: type.toString(),
      })
      .select()

    if (error) {
      console.error("[v0] [Transactions] Insert error - FULL DETAILS:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        status: error.status,
      })
      return NextResponse.json(
        {
          error: "Failed to create transaction",
          details: error.message,
        },
        { status: 500 }
      )
    }

    console.log("[v0] Successfully inserted transaction:", data?.[0]?.id)
    return NextResponse.json({ transaction: data?.[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] [Transactions] Server error - FULL DETAILS:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
