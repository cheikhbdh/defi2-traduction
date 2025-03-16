import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// Mettre à jour un mot existant
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const id = context.params.id
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Vérifier si l'utilisateur est authentifié
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour modifier un mot" }, { status: 401 })
    }

    // Récupérer les données du corps de la requête
    const { term, definition, part_of_speech, example } = await request.json()

    // Validation des données
    if (!term || !definition) {
      return NextResponse.json({ error: "Le terme et la définition sont requis" }, { status: 400 })
    }

    // Vérifier que l'utilisateur est le créateur du mot
    const { data: word, error: wordError } = await supabase.from("words").select("created_by").eq("id", id).single()

    if (wordError) {
      return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 })
    }

    if (word.created_by !== session.user.id) {
      return NextResponse.json({ error: "Vous n'êtes pas autorisé à modifier ce mot" }, { status: 403 })
    }

    // Mettre à jour le mot
    const { data, error } = await supabase
      .from("words")
      .update({
        term,
        definition,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Erreur lors de la mise à jour:", error)
      return NextResponse.json({ error: "Erreur lors de la mise à jour du mot" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

// Supprimer un mot
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const id = context.params.id
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Vérifier si l'utilisateur est authentifié
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour supprimer un mot" }, { status: 401 })
    }

    // Vérifier que l'utilisateur est le créateur du mot
    const { data: word, error: wordError } = await supabase.from("words").select("created_by").eq("id", id).single()

    if (wordError) {
      return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 })
    }

    if (word.created_by !== session.user.id) {
      return NextResponse.json({ error: "Vous n'êtes pas autorisé à supprimer ce mot" }, { status: 403 })
    }

    // Supprimer le mot
    const { error } = await supabase.from("words").delete().eq("id", id)

    if (error) {
      console.error("Erreur lors de la suppression:", error)
      return NextResponse.json({ error: "Erreur lors de la suppression du mot" }, { status: 500 })
    }

    // Réduire les points de l'utilisateur (optionnel)
    const { data: rewards, error: rewardsError } = await supabase
      .from("rewards")
      .select("points")
      .eq("user_id", session.user.id)
      .single()

    if (!rewardsError && rewards) {
      // Réduire les points (minimum 0)
      const newPoints = Math.max(0, rewards.points - 5)

      await supabase
        .from("rewards")
        .update({
          points: newPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", session.user.id)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

