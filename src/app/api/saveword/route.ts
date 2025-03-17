import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    console.log("Received request to save word")

    // Initialize cookies and Supabase client inside the request context
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const body = await request.json()
    console.log("Request body:", body)

    const { term, definition, userId, comment } = body

    if (!term || !definition) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Term and definition are required" }, { status: 400 })
    }

    if (!userId) {
      console.log("User not authenticated")
      return NextResponse.json({ error: "You must be logged in to add words to the dictionary" }, { status: 401 })
    }

    console.log("Inserting word into database")
    const { data: wordData, error: wordError } = await supabase
      .from("words")
      .insert({
        term,
        definition,
        status: "en_attente", 
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (wordError) {
      console.error("Error inserting word:", wordError)
      return NextResponse.json({ error: "Failed to save word: " + wordError.message }, { status: 500 })
    }

    console.log("Word inserted successfully:", wordData)
    const wordId = wordData[0].id
    if (comment) {
      console.log("Recording contribution")
      const { error: contributionError } = await supabase.from("contributions").insert({
        word_id: wordId,
        user_id: userId,
        comment,
        created_at: new Date().toISOString(),
      })

      if (contributionError) {
        console.error("Error recording contribution:", contributionError)
      }
    }

    console.log("Awarding points to user")
    try {
      const { error: rewardError } = await supabase.from("rewards").upsert(
        {
          user_id: userId,
          points: 10, 
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )

      if (rewardError) {
        console.error("Error awarding points:", rewardError)
      }
    } catch (rewardErr) {
      console.error("Exception in rewards:", rewardErr)
    }

    console.log("Word saved successfully with ID:", wordId)
    return NextResponse.json({
      success: true,
      wordId,
      message: "Word saved successfully",
    })
  } catch (error) {
    console.error("Error saving word:", error)
    return NextResponse.json(
      { error: "Failed to save word: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}