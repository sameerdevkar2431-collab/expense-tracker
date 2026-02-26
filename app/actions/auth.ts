"use server"

import { createClient } from "@/lib/supabase/server"

export async function createUserProfile(
  userId: string,
  email: string,
  name: string
) {
  try {
    const supabase = createClient()
    
    // Use service role to bypass RLS
    const { error } = await supabase.from("users").insert({
      id: userId,
      email: email,
      name: name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Server: Profile creation error:", error)
      throw new Error("Failed to create user profile: " + error.message)
    }

    console.log("[v0] Server: User profile created successfully for:", userId)
    return { success: true }
  } catch (err) {
    console.error("[v0] Server action error:", err)
    throw err
  }
}
