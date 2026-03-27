"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function signupServerAction(email: string, password: string, name: string) {
  try {
    const supabase = await createClient()
    console.log("[v0] Server signup for:", email)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (authError) {
      console.error("[v0] Auth signup error:", authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error("User creation failed")
    }

    console.log("[v0] Auth user created:", authData.user.id)

    // Create user profile using admin client (bypasses RLS)
    const adminClient = createAdminClient()
    const { error: profileError } = await adminClient.from("users").insert({
      id: authData.user.id,
      email: authData.user.email || email,
      name: name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("[v0] Profile creation error:", profileError)
      throw new Error("Failed to create user profile: " + profileError.message)
    }

    console.log("[v0] User profile created successfully")

    // Sign in the user immediately after signup using signInWithPassword
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error("[v0] Auto sign-in after signup failed:", signInError)
      // Don't throw - signup was successful, just sign-in failed
      // User can still manually log in
    } else if (signInData.user) {
      console.log("[v0] User auto-signed in after signup")
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        name: name,
      },
    }
  } catch (error) {
    console.error("[v0] Signup action failed:", error)
    throw error
  }
}
