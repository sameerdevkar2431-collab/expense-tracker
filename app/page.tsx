"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function IncomePage() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddIncome = async () => {
    setLoading(true)

    const { data, error } = await supabase.from("transactions").insert([
      {
        user_id: null, // change later if using auth
        type: "income",
        amount: Number(amount),
        description: description,
        date: new Date().toISOString().split("T")[0],
      },
    ])

    if (error) {
      console.log("ERROR:", error)
      alert("Failed to create transaction")
    } else {
      alert("Income added successfully!")
      setAmount("")
      setDescription("")
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: "30px", maxWidth: "500px", margin: "auto" }}>
      <h1>Income Tracker</h1>

      <div style={{ marginTop: "20px" }}>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <button
          onClick={handleAddIncome}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "green",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Adding..." : "Add Income"}
        </button>
      </div>
    </div>
  )
}