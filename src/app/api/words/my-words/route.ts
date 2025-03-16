import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey)

   const session = await getCurrentUser()

    const { data: words, error } = await supabase
      .from("words")
      .select("*")
      .eq("created_by", session?.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Récupérer les statistiques de base
    const { count: totalWords } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("created_by", session?.id)

    const { count: approvedWords } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("created_by", session?.id)
      .eq("status", "approved")

    const { count: pendingWords } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("created_by", session?.id)
      .eq("status", "pending")

    // Récupérer les points de l'utilisateur
    const { data: rewards } = await supabase.from("rewards").select("points").eq("user_id", session?.id).single()

    const stats = {
      totalWords: totalWords || 0,
      approvedWords: approvedWords || 0,
      pendingWords: pendingWords || 0,
      points: rewards?.points || 0,
    }

    return NextResponse.json(
      {
        words: words || [],
        stats,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erreur lors de la récupération des mots:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des mots" }, { status: 500 })
  }
}

