import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Vérifier si l'utilisateur est authentifié
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour ajouter un mot" }, { status: 401 })
    }

    const { term, definition } = await request.json()

    // Validation des données
    if (!term || !definition) {
      return NextResponse.json({ error: "Le terme et la définition sont requis" }, { status: 400 })
    }

    // Insérer le nouveau mot dans la base de données
    const { data, error } = await supabase
      .from("words")
      .insert([
        {
          term,
          definition,
          status: "en_attente", 
          created_by: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Erreur lors de l'insertion:", error)
      return NextResponse.json({ error: "Erreur lors de l'enregistrement du mot" }, { status: 500 })
    }

    // Ajouter 10 points à l'utilisateur
    const userId = session.user.id

    // Vérifier si l'utilisateur a déjà une entrée dans la table rewards
    const { data: rewardData, error: rewardError } = await supabase
      .from("rewards")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (rewardError && rewardError.code !== "PGRST116") {
      // PGRST116 = not found
      console.error("Erreur lors de la vérification des récompenses:", rewardError)
      // Continuer malgré l'erreur, car l'ajout du mot a réussi
    }

    if (rewardData) {
      // Mettre à jour les points existants
      const { error: updateError } = await supabase
        .from("rewards")
        .update({
          points: rewardData.points + 10,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (updateError) {
        console.error("Erreur lors de la mise à jour des points:", updateError)
      }
    } else {
      // Créer une nouvelle entrée de récompense
      const { error: insertError } = await supabase.from("rewards").insert([
        {
          user_id: userId,
          points: 10,
          badges: [],
          updated_at: new Date().toISOString(),
        },
      ])

      if (insertError) {
        console.error("Erreur lors de la création des récompenses:", insertError)
      }
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

// Ajouter la route GET pour récupérer tous les mots
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Vérifier si l'utilisateur est authentifié
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour voir les mots" }, { status: 401 })
    }

    // Récupérer tous les mots
    const { data, error } = await supabase.from("words").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur lors de la récupération des mots:", error)
      return NextResponse.json({ error: "Erreur lors de la récupération des mots" }, { status: 500 })
    }

    return NextResponse.json({ success: true, words: data }, { status: 200 })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

