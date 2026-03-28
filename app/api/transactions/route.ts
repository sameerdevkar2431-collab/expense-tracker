import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// Create Supabase client for API routes using admin key
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Extract user ID from Authorization header token
async function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] No authorization header")
      return null
    }

    const token = authHeader.substring(7)
    const supabase = createAdminClient()

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error) {
      console.log("[v0] Token verification error:", error.message)
      return null
    }

    console.log("[v0] User from token:", user?.id)
    return user
  } catch (err) {
    console.error("[v0] Error getting user from token:", err)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/transactions - Starting")

    const user = await getUserFromToken(request)
    console.log("[v0] Auth check:", { hasUser: !!user })

    if (!user) {
      console.log("[v0] Unauthorized - no user from token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

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

    const user = await getUserFromToken(request)
    console.log("[v0] Auth check:", { hasUser: !!user })

    if (!user) {
      console.log("[v0] Unauthorized - no user from token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { amount, category_id, description, date, type } = body

    // Validate required fields
    if (!amount || !category_id || !date || !type) {
      console.log("[v0] Validation failed - missing fields:", {
        amount: !!amount,
        category_id: !!category_id,
        date: !!date,
        type: !!type,
      })
      return NextResponse.json(
        { error: "Missing required fields: amount, category_id, date, type" },
        { status: 400 }
      )
    }

    // Validate and convert amount to number
    const parsedAmount = parseFloat(amount.toString())
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    // Validate type
    if (!["expense", "income"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'expense' or 'income'" }, { status: 400 })
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Date must be in YYYY-MM-DD format" }, { status: 400 })
    }

    console.log("[v0] Inserting transaction for user:", user.id, {
      amount: parsedAmount,
      category_id,
      type,
      date,
    })

    // Insert transaction with proper data types
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: parsedAmount,
        category_id: category_id.toString(),
        description: description && description.toString().trim() ? description.toString().trim() : null,
        date: date.toString(),
        type: type.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

export async function PUT(request: NextRequest) {
  try {
    console.log("[v0] PUT /api/transactions - Starting")

    const user = await getUserFromToken(request)
    
    if (!user) {
      console.log("[v0] Unauthorized - no user from token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    const body = await request.json()
    const { id, amount, category_id, description, date, type } = body

    // Validate required fields
    if (!id || !amount || !category_id || !date || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate amount
    const parsedAmount = parseFloat(amount.toString())
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    console.log("[v0] Updating transaction:", id, "for user:", user.id)

    // Update transaction (RLS ensures user can only update their own)
    const { data, error } = await supabase
      .from("transactions")
      .update({
        amount: parsedAmount,
        category_id: category_id.toString(),
        description: description && description.toString().trim() ? description.toString().trim() : null,
        date: date.toString(),
        type: type.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()

    if (error) {
      console.error("[v0] Update error:", error)
      return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
    }

    console.log("[v0] Successfully updated transaction:", id)
    return NextResponse.json({ transaction: data?.[0] }, { status: 200 })
  } catch (error) {
    console.error("[v0] [Transactions] Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      console.log("[v0] Unauthorized - no user from token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    console.log("[v0] Deleting transaction:", id, "for user:", user.id)

    // Delete transaction (RLS ensures user can only delete their own)
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Delete error:", error)
      return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
    }

    console.log("[v0] Successfully deleted transaction:", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] [Transactions] Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
