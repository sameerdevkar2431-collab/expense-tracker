"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function signupServerAction(email: string, password: string, name: string) {
  try {
    console.log("[v0] Server signup for:", email)

    // Use admin client to create user (bypasses email confirmation requirement)
    const adminClient = createAdminClient()

    // Create auth user with admin client - no confirmation email sent
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirm email, skip sending confirmation
      user_metadata: { name },
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
