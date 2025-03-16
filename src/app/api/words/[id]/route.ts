import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

// Fonction pour obtenir le client Supabase
function getSupabaseClient() {
    const cookieStore = cookies()
    return createRouteHandlerClient({ cookies: () => cookieStore })

}

// Fonction pour obtenir l'utilisateur actuel
async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return {
    id: session.user.id,
    email: session.user.email,
    role: profile?.role || "moderateur",
    name: profile?.name || session.user.email,
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient()
    const id = Number.parseInt(params.id)

    // Récupérer le mot
    const { data: word, error: wordError } = await supabase.from("words").select("*").eq("id", id).single()

    if (wordError || !word) {
      return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 })
    }

    // Récupérer les variantes du mot
    const { data: variants, error: variantsError } = await supabase.from("word_variants").select("*").eq("word_id", id)

    if (variantsError) {
      console.error("Erreur lors de la récupération des variantes:", variantsError)
    }

    // Récupérer les contributions liées au mot
    const { data: contributions, error: contributionsError } = await supabase
      .from("contributions")
      .select(`
        *,
        profiles:profiles(name)
      `)
      .eq("word_id", id)

    if (contributionsError) {
      console.error("Erreur lors de la récupération des contributions:", contributionsError)
    }

    // Formater les contributions pour correspondre à l'ancien format
    const formattedContributions =
      contributions?.map((contribution) => ({
        ...contribution,
        contributor_name: contribution.profiles?.name,
      })) || []

    return NextResponse.json(
      {
        word,
        variants: variants || [],
        contributions: formattedContributions,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erreur lors de la récupération du mot:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du mot" }, { status: 500 })
  }
}

// PUT /api/words/[id] - Modifier un mot existant
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Vous devez être connecté pour modifier un mot" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const body = await request.json()
    const { term, definition } = body

    // Vérifier si le mot existe
    const { data: existingWord, error: wordError } = await supabase.from("words").select("*").eq("id", id).single()

    if (wordError || !existingWord) {
      return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 })
    }

    // Vérifier si l'utilisateur est l'auteur du mot ou un administrateur
    if (existingWord.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Vous n'êtes pas autorisé à modifier ce mot" }, { status: 403 })
    }

    // Mettre à jour le mot
    const { data: updatedWord, error: updateError } = await supabase
      .from("words")
      .update({
        term: term || existingWord.term,
        definition: definition || existingWord.definition,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Ajouter une contribution pour tracer la modification
    const { error: contributionError } = await supabase.from("contributions").insert({
      word_id: id,
      user_id: user.id,
      comment: "Modification du mot",
      created_at: new Date().toISOString(),
    })

    if (contributionError) {
      console.error("Erreur lors de l'ajout de la contribution:", contributionError)
    }

    return NextResponse.json({ word: updatedWord }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la modification du mot:", error)
    return NextResponse.json({ error: "Erreur lors de la modification du mot" }, { status: 500 })
  }
}

// DELETE /api/words/[id] - Supprimer un mot
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Vous devez être connecté pour supprimer un mot" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)

    // Vérifier si le mot existe
    const { data: existingWord, error: wordError } = await supabase.from("words").select("*").eq("id", id).single()

    if (wordError || !existingWord) {
      return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 })
    }

    // Vérifier si l'utilisateur est l'auteur du mot ou un administrateur
    if (existingWord.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Vous n'êtes pas autorisé à supprimer ce mot" }, { status: 403 })
    }

    // Supprimer d'abord les variantes du mot
    const { error: variantsError } = await supabase.from("word_variants").delete().eq("word_id", id)

    if (variantsError) {
      console.error("Erreur lors de la suppression des variantes:", variantsError)
    }

    // Supprimer les contributions liées au mot
    const { error: contributionsError } = await supabase.from("contributions").delete().eq("word_id", id)

    if (contributionsError) {
      console.error("Erreur lors de la suppression des contributions:", contributionsError)
    }

    // Supprimer le mot
    const { error: deleteError } = await supabase.from("words").delete().eq("id", id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ message: "Mot supprimé avec succès" }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la suppression du mot:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du mot" }, { status: 500 })
  }
}

