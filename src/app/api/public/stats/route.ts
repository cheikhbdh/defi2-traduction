import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies() 
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Récupérer le nombre total de mots
    const { count: totalWords, error: totalWordsError } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })

    if (totalWordsError) {
      console.error("Erreur lors du comptage des mots:", totalWordsError)
      return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 })
    }

    // Récupérer le nombre de mots approuvés
    const { count: approvedWords, error: approvedWordsError } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    if (approvedWordsError) {
      console.error("Erreur lors du comptage des mots approuvés:", approvedWordsError)
      return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 })
    }

    // Récupérer le nombre de mots en attente
    const { count: pendingWords, error: pendingWordsError } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("status", "en_attente")

    if (pendingWordsError) {
      console.error("Erreur lors du comptage des mots en attente:", pendingWordsError)
      return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 })
    }

    // Récupérer le nombre de contributeurs uniques
    const { data: contributors, error: contributorsError } = await supabase
      .from("words")
      .select("created_by")
      .not("created_by", "is", null)

    if (contributorsError) {
      console.error("Erreur lors de la récupération des contributeurs:", contributorsError)
      return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 })
    }

    // Compter les contributeurs uniques
    const uniqueContributors = new Set(contributors.map((item) => item.created_by)).size

    // Récupérer les 5 derniers mots ajoutés (approuvés)
    const { data: recentWords, error: recentWordsError } = await supabase
      .from("words")
      .select("id, term, definition, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentWordsError) {
      console.error("Erreur lors de la récupération des mots récents:", recentWordsError)
      return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 })
    }

    // Récupérer les top 5 contributeurs
    const { data: topContributors, error: topContributorsError } = await supabase
      .from("rewards")
      .select("user_id, points, badges")
      .order("points", { ascending: false })
      .limit(5)

    if (topContributorsError) {
      console.error("Erreur lors de la récupération des top contributeurs:", topContributorsError)
      return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 })
    }

    // Récupérer les noms des top contributeurs
    const userIds = topContributors.map((contributor) => contributor.user_id)
    let topContributorsWithNames = []

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds)

      if (profilesError) {
        console.error("Erreur lors de la récupération des profils:", profilesError)
      } else {
        // Fusionner les données des récompenses avec les noms des utilisateurs
        topContributorsWithNames = topContributors.map((contributor) => {
          const profile = profiles.find((p) => p.id === contributor.user_id)
          return {
            ...contributor,
            name: profile ? profile.name : "Utilisateur anonyme",
          }
        })
      }
    }

    return NextResponse.json(
      {
        totalWords,
        approvedWords,
        pendingWords,
        uniqueContributors,
        recentWords,
        topContributors: topContributorsWithNames,
        challenge: {
          total: 1000,
          completed: approvedWords || 0, 
          percentage: Math.min(100, Math.round(((approvedWords || 0) / 1000) * 100)),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

