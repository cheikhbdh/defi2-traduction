import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Vérifier si l'utilisateur est authentifié
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour approuver un mot" }, { status: 401 })
    }

    // Vérifier le rôle de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Erreur lors de la vérification du profil" }, { status: 500 })
    }

    if (!profile || !["moderateur", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Vous n'avez pas les droits pour approuver des mots" }, { status: 403 })
    }

    // Mettre à jour le statut du mot
    const { data, error } = await supabase
      .from("words")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Erreur lors de l'approbation:", error)
      return NextResponse.json({ error: "Erreur lors de l'approbation du mot" }, { status: 500 })
    }

    // Ajouter des points au contributeur
    const { data: word } = await supabase.from("words").select("created_by").eq("id", id).single()

    if (word && word.created_by) {
      // Vérifier si l'utilisateur a déjà une entrée dans la table rewards
      const { data: rewardData, error: rewardError } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", word.created_by)
        .single()

      if (rewardError && rewardError.code !== "PGRST116") {
        // PGRST116 = not found
        console.error("Erreur lors de la vérification des récompenses:", rewardError)
      }

      if (rewardData) {
        // Mettre à jour les points existants (ajouter 15 points pour l'approbation)
        await supabase
          .from("rewards")
          .update({
            points: rewardData.points + 15,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", word.created_by)
      } else {
        // Créer une nouvelle entrée de récompense
        await supabase.from("rewards").insert([
          {
            user_id: word.created_by,
            points: 15,
            badges: [],
            updated_at: new Date().toISOString(),
          },
        ])
      }
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

