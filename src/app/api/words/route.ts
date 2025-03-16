import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth-utils"

function getSupabaseClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    let query = supabase.from("words").select("*")

    if (userId) {
      query = query.eq("created_by", userId)
    }
    if (status) {
      query = query.eq("status", status)
    }

    const { data: words, error } = await query.order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ words }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération des mots:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des mots" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
    try {
      const supabase = getSupabaseClient()
  
      const userData = await getCurrentUser()
console.log(userData)
  
      const body = await request.json()
      const { term, definition} = body
  
      if (!term || !definition) {
        return NextResponse.json({ error: "Le terme et la définition sont requis" }, { status: 400 })
      }
  
      const { data: newWord, error: insertError } = await supabase
        .from("words")
        .insert({
          term,
          definition,
          status: "pending",
          created_by: userData?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
  
      if (insertError) {
        throw insertError
      }
  
      // Mettre à jour les points de récompense
      const { data: existingRewards } = await supabase
        .from("rewards")
        .select("points")
        .eq("user_id", userData?.id)
        .single()
  
      if (existingRewards) {
        await supabase
          .from("rewards")
          .update({
            points: existingRewards.points + 5,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userData?.id)
      } else {
        await supabase.from("rewards").insert({
          user_id: userData?.id,
          points: 5,
          updated_at: new Date().toISOString(),
        })
      }
  
      return NextResponse.json({ word: newWord }, { status: 201 })
    } catch (error) {
      console.error("Erreur lors de la création du mot:", error)
      return NextResponse.json({ error: "Erreur lors de la création du mot" }, { status: 500 })
    }
  }
  

