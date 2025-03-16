import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id  // ✅ Correction ici
    console.log("ID reçu:", id)

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Vérifier si l'utilisateur est authentifié
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData?.session

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour approuver un mot" }, { status: 401 })
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
      return NextResponse.json({ error: "Vous n'avez pas les droits pour approuver des mots" }, { status: 403 })
    }

    // Mettre à jour le statut du mot
    const { data: updatedWord, error: updateError } = await supabase
      .from("words")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError || !updatedWord) {
      console.error("Erreur update:", updateError)
      return NextResponse.json({ error: "Erreur lors de l'approbation du mot" }, { status: 500 })
    }

    console.log("Mot approuvé:", updatedWord)

    // Ajouter des points au contributeur
    const { data: word, error: wordError } = await supabase
      .from("words")
      .select("created_by")
      .eq("id", id)
      .single()

    if (wordError || !word) {
      console.error("Erreur récupération mot:", wordError)
      return NextResponse.json({ error: "Erreur lors de la récupération du mot" }, { status: 500 })
    }

    console.log("Mot créé par:", word.created_by)

    if (word.created_by) {
      const { data: rewardData, error: rewardError } = await supabase
        .from("rewards")
        .select("points")
        .eq("user_id", word.created_by)
        .single()

      if (rewardError && !rewardData) {
        console.error("Erreur récupération récompenses:", rewardError)
      }

      if (rewardData) {
        console.log("Points actuels:", rewardData.points)
        await supabase
          .from("rewards")
          .update({
            points: (rewardData.points || 0) + 15,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", word.created_by)
      } else {
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

    return NextResponse.json({ success: true, data: updatedWord }, { status: 200 })
  } catch (error) {
    console.error("Erreur inconnue:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}
