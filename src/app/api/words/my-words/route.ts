import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 })
    }

    // Fetch words created by the user
    const { data: words, error } = await supabase
      .from("words")
      .select("*")
      .eq("created_by", session.user.id) // Use session.user.id
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Fetch basic statistics
    const { count: totalWords } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("created_by", session.user.id) // Use session.user.id

    const { count: approvedWords } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("created_by", session.user.id) // Use session.user.id
      .eq("status", "approved")

    const { count: pendingWords } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("created_by", session.user.id) // Use session.user.id
      .eq("status", "pending")

    // Fetch user rewards
    const { data: rewards } = await supabase
      .from("rewards")
      .select("points")
      .eq("user_id", session.user.id) // Use session.user.id
      .single()

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