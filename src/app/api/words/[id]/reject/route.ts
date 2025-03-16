import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const id = context.params.id
    console.log("ID reçu pour rejet:", id)

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Vérifier si l'utilisateur est authentifié
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData?.session

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour rejeter un mot" }, { status: 401 })
    }

    // Vérifier le rôle de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile) {
      console.error("Erreur profil:", profileError)
      return NextResponse.json({ error: "Erreur lors de la vérification du profil" }, { status: 500 })
    }

    if (!["moderateur", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Vous n'avez pas les droits pour rejeter des mots" }, { status: 403 })
    }

    // Mettre à jour le statut du mot
    const { data, error } = await supabase
      .from("words")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Erreur lors du rejet:", error)
      return NextResponse.json({ error: "Erreur lors du rejet du mot" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

