"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

type Word = {
  id: number
  term: string
  definition: string
  status: string
}

type Variant = {
  variant: string
  type: string
}

export default function WordVariantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [generating, setGenerating] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("Auth error:", error)
          setError("Authentication error: " + error.message)
          return
        }

        if (user) {
          console.log("User authenticated:", user.id)
          setUserId(user.id)
        } else {
          console.log("No user found")
          // For testing purposes, you can uncomment this to bypass authentication
          // setUserId("test-user-id")
        }
      } catch (err) {
        console.error("Failed to get user:", err)
      }
    }

    getUser()
  }, [])

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchWords(searchTerm)
    } else {
      setWords([])
    }
  }, [searchTerm])

  const searchWords = async (term: string) => {

    try {
      const { data, error } = await supabase.from("words").select("*").ilike("term", `%${term}%`).limit(10)

      if (error) throw error
      setWords(data || [])
    } catch (err) {
      console.error("Error searching words:", err)
      setError("Failed to search words")
    } 
  }

  const selectWord = async (word: Word) => {
    setSelectedWord(word)
    setSearchTerm("")
    setWords([])

    // Fetch existing variants for this word
    try {
      const { data, error } = await supabase.from("word_variants").select("*").eq("word_id", word.id)

      if (error) throw error
      setVariants(data || [])
      setSelectedVariants(data || [])
    } catch (err) {
      console.error("Error fetching variants:", err)
      setError("Failed to fetch existing variants")
    }
  }

  const generateVariants = async () => {
    if (!selectedWord) {
      setError("Please select a word first")
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-variants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: selectedWord.id,
          term: selectedWord.term,
          userId: userId || "test-user-id", // Use a test ID if not logged in
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate variants")
      }


      // Fetch the updated variants
      const { data: updatedVariants, error } = await supabase
        .from("word_variants")
        .select("*")
        .eq("word_id", selectedWord.id)

      if (error) throw error

      setVariants(updatedVariants || [])
      setSelectedVariants(updatedVariants || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setGenerating(false)
    }
  }

  const toggleVariant = (variant: Variant) => {
    setSelectedVariants((prev) => {
      const isSelected = prev.some((v) => v.variant === variant.variant && v.type === variant.type)

      if (isSelected) {
        return prev.filter((v) => !(v.variant === variant.variant && v.type === variant.type))
      } else {
        return [...prev, variant]
      }
    })
  }

  const isVariantSelected = (variant: Variant) => {
    return selectedVariants.some((v) => v.variant === variant.variant && v.type === variant.type)
  }

  const getVariantsByType = (type: string) => {
    return variants.filter((v) => v.type === type)
  }

  const getVariantTypes = () => {
    const types = new Set(variants.map((v) => v.type))
    return Array.from(types)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Word Variants Generator</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Word Variants</CardTitle>
          <CardDescription>Search for a Hassaniya word to generate its grammatical variants using AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="word-search">Search Word</Label>
              <div className="relative">
                <Input
                  id="word-search"
                  placeholder="Type to search for a word..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {words.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    {words.map((word) => (
                      <div key={word.id} className="p-2 hover:bg-muted cursor-pointer" onClick={() => selectWord(word)}>
                        <div className="font-medium">{word.term}</div>
                        <div className="text-sm text-muted-foreground truncate">{word.definition}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedWord && (
              <div className="p-4 border rounded-md bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{selectedWord.term}</h3>
                    <p className="text-sm text-muted-foreground">{selectedWord.definition}</p>
                  </div>
                  <Badge variant={selectedWord.status === "approved" ? "default" : "outline"}>
                    {selectedWord.status}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={generateVariants} disabled={generating || !selectedWord}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Variants"
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">{error}</div>}

      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Variants for &quot;{selectedWord?.term}&quot;</CardTitle>
            <CardDescription>Review the AI-generated variants for this word</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={getVariantTypes()[0] || "conjugation"}>
              <TabsList className="mb-4">
                {getVariantTypes().map((type) => (
                  <TabsTrigger key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {getVariantTypes().map((type) => (
                <TabsContent key={type} value={type} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getVariantsByType(type).map((variant, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${
                          isVariantSelected(variant) ? "border-primary bg-primary/10" : "border-muted"
                        }`}
                        onClick={() => toggleVariant(variant)}
                      >
                        <span>{variant.variant}</span>
                        {isVariantSelected(variant) ? (
                          <Check className="h-5 w-5 text-primary" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

