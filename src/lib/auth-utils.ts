import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./supabase-types"


// Get the current user with role
export async function getCurrentUser() {
  const supabase = createClientComponentClient<Database>()

  try {
    // Récupérer la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Erreur lors de la récupération de la session:", sessionError)
      return null
    }

    console.log("Session in getCurrentUser:", session)

    if (!session || !session.user) {
      console.log("⚠️ Aucune session active trouvée")
      return null
    }

    // Vérifier si l'utilisateur existe dans la table `profiles`
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("⚠️ Profil utilisateur introuvable:", profileError)
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: profile.role,
    }
  } catch (error) {
    console.error("Erreur dans getCurrentUser:", error)
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

