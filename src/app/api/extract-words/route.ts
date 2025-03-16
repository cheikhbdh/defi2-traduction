import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";



const cookieStore = cookies()
const supabase = createRouteHandlerClient({ cookies: () => cookieStore })


export async function POST(request: Request) {
    try {
      const formData = await request.formData();
      const textContent = formData.get("text") as string;
      
      if (!textContent) {
        return NextResponse.json(
          { error: "Text content is required" },
          { status: 400 }
        );
      }
  
      // Get existing words from dictionary
      const { data: existingWords, error: fetchError } = await supabase
        .from("words")
        .select("id, term")
        .limit(1000);
  
      if (fetchError) {
        console.error("Error fetching existing words:", fetchError);
        return NextResponse.json(
          { error: "Failed to fetch existing words" },
          { status: 500 }
        );
      }
  
      const existingTermsSet = new Set(existingWords?.map(w => w.term.toLowerCase()) || []);
  
      // Simple word extraction (sans IA)
      // Diviser le texte en mots, nettoyer et compter les occurrences
      const words = textContent.split(/\s+/)
        .map(word => word.replace(/[.,;:!?()[\]{}'"«»]/g, '').toLowerCase())
        .filter(word => word.length > 1); // Ignorer les mots trop courts
      
      const wordFrequency = new Map();
      const wordContexts = new Map();
      
      words.forEach((word, index) => {
        // Compter la fréquence
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        
        // Capturer le contexte (mots avant et après)
        if (!wordContexts.has(word)) {
          const start = Math.max(0, index - 3);
          const end = Math.min(words.length, index + 4);
          const context = words.slice(start, end).join(' ');
          wordContexts.set(word, context);
        }
      });
      
      // Formater les résultats
      const extractedWords = Array.from(wordFrequency.entries()).map(([term, frequency]) => ({
        term,
        context: wordContexts.get(term),
        frequency
      }));
  
      // Filter out words that already exist in the dictionary
      const newWords = extractedWords.filter(
        (word) => !existingTermsSet.has(word.term.toLowerCase())
      );
  
      return NextResponse.json({
        totalExtracted: extractedWords.length,
        newWords,
        existingWords: extractedWords.length - newWords.length,
      });
    } catch (error) {
      console.error("Error extracting words:", error);
      return NextResponse.json(
        { error: "Failed to extract words" },
        { status: 500 }
      );
    }
  }