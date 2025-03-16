import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { wordId, term } = await request.json();

    if (!wordId || !term) {
      return NextResponse.json(
        { error: "Word ID and term are required" },
        { status: 400 }
      );
    }

    // Generate variants using AI
    const { text: variantsText } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        Generate grammatical variants for the Hassaniya word "${term}".
        
        Please provide the following forms (if applicable):
        1. Conjugations (for verbs)
        2. Plural forms (for nouns)
        3. Feminine/masculine forms (if applicable)
        4. Diminutive forms
        5. Related derived words
        
        Format the response as a JSON array of objects, each with:
        1. "variant": the variant form of the word
        2. "type": the type of variant (e.g., "conjugation", "plural", "feminine", "diminutive", "derivative")
        
        Example:
        [
          {
            "variant": "example_variant1",
            "type": "conjugation"
          },
          {
            "variant": "example_variant2",
            "type": "plural"
          }
        ]
        
        Only include variants that are applicable to this word.
      `,
    });

    // Parse the AI response
    let variants;
    try {
      variants = JSON.parse(variantsText);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Store the variants in Supabase
    const insertPromises = variants.map(async (variant: { variant: string; type: string }) => {
      return supabase
        .from("word_variants")
        .insert({
          word_id: wordId,
          variant: variant.variant,
          type: variant.type
        });
    });

    await Promise.all(insertPromises);

    return NextResponse.json({ 
      success: true,
      variants,
      message: "Variants generated and stored successfully" 
    });
  } catch (error) {
    console.error("Error generating variants:", error);
    return NextResponse.json(
      { error: "Failed to generate variants" },
      { status: 500 }
    );
  }
}
