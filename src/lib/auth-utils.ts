import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./supabase-types"


// Get the current user with role
export async function getCurrentUser() {
  const supabase = createClientComponentClient<Database>()

  try {
    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("Session in getCurrentUser:", session)

    if (!session) {
      console.log("⚠️ No session found in getCurrentUser")
      return null
    }

    // Fetch the user profile with role information
    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    console.log("Profile:", profile, "Error:", error)

    if (error || !profile) {
      console.log("⚠️ Error or profile not found:", error)
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: profile.role,
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}



export async function hasRole(role: string) {
  const user = await getCurrentUser()
  return user?.role === role
}


// Sign out the user
export async function signOut() {
  const supabase = createClientComponentClient<Database>()
  await supabase.auth.signOut()
}

