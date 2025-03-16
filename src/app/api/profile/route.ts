import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Vérifier si l'utilisateur est authentifiécookies: () => cookieStore})

    // Vérifier si l'utilisateur est authentifié
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour accéder à votre profil" }, { status: 401 })
    }

    // Récupérer le profil de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Erreur lors de la récupération du profil" }, { status: 500 })
    }

    // Récupérer les récompenses de l'utilisateur
    const { data: rewards, error: rewardsError } = await supabase
      .from("rewards")
      .select("*")
      .eq("user_id", session.user.id)
      .single()

    if (rewardsError && rewardsError.code !== "PGRST116") {
      // PGRST116 = not found
      console.error("Erreur lors de la récupération des récompenses:", rewardsError)
    }

    return NextResponse.json(
      {
        ...profile,
        rewards: rewards || { points: 0, badges: [] },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

