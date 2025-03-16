"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/auth-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"



type ExtractedWord = {
  term: string
  context: string
  frequency: number
}

export default function TextAnalysisPage() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    totalExtracted: number
    newWords: ExtractedWord[]
    existingWords: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [wordToAdd, setWordToAdd] = useState<ExtractedWord | null>(null)
  const [definition, setDefinition] = useState("")
  const [comment, setComment] = useState("")
  const [addingWord, setAddingWord] = useState(false)

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      try {
        const user =await getCurrentUser()

        if (user) {
          console.log("User authenticated:", user.id)
          setUserId(user.id)
        } else {
          console.log("No user found")
          setError("authentification required");
        }
      } catch (err) {
        console.error("Failed to get user:", err)
      }
    }

    getUser()
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setText(event.target?.result as string)
    }
    reader.readAsText(file)
  }

  const analyzeText = async () => {
    if (!text.trim()) {
      setError("Please enter or upload text to analyze")
      return
    }

    // For development/testing, allow analysis without login
    if (!userId) {
      // You can either show an error or use a test user ID
      // setError("You must be logged in to analyze text")
      // return

      // For testing purposes:
      console.log("Using test user ID for analysis")
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("text", text)
      formData.append("userId", userId || "test-user-id") // Use a test ID if not logged in

      const response = await fetch("/api/extract-words", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to analyze text")
      }

      const data = await response.json()
      setResults(data)
      setSelectedWords([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Modify the openAddWordDialog function to check for authentication
  const openAddWordDialog = (word: ExtractedWord) => {
    if (!userId) {
      setError("Vous devez être connecté pour ajouter des mots au dictionnaire.")
      return
    }

    setWordToAdd(word)
    setDefinition("")
    setComment("")
  }

  // Modify the addWordToDictionary function to require authentication
  const addWordToDictionary = async () => {
    if (!userId) {
      setError("Vous devez être connecté pour ajouter des mots au dictionnaire.")
      return
    }

    if (!wordToAdd || !definition) {
      setError("Le mot et la définition sont obligatoires")
      return
    }

    console.log("Adding word to dictionary:", {
      term: wordToAdd.term,
      definition,
      userId,
      comment,
    })

    setAddingWord(true)
    try {
      // Use the correct API endpoint with debugging
      const response = await fetch("/api/saveword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: wordToAdd.term,
          definition,
          userId,
          comment,
        }),
      })

      console.log("API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error:", errorData)
        throw new Error(errorData.error || "Échec de l'ajout du mot au dictionnaire")
      }

      const data = await response.json()
      console.log("API success:", data)

      // Update the results to remove added word
      setResults((prev) => {
        if (!prev) return null
        return {
          ...prev,
          newWords: prev.newWords.filter((w) => w.term !== wordToAdd.term),
          existingWords: prev.existingWords + 1,
        }
      })

      setWordToAdd(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'ajout du mot au dictionnaire")
    } finally {
      setAddingWord(false)
    }
  }

  const filteredWords =
    results?.newWords.filter((word) => word.term.toLowerCase().includes(searchTerm.toLowerCase())) || []

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Text Analysis & Word Extraction</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Analyze Hassaniya Text</CardTitle>
          <CardDescription>Upload or paste Hassaniya text to extract words not in the dictionary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="text-input">Text Content</Label>
              <Textarea
                id="text-input"
                placeholder="Paste Hassaniya text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </Label>
              <span className="text-sm text-muted-foreground">Supported formats: .txt, .doc, .docx, .pdf</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={analyzeText} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Text
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">{error}</div>}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Found {results.totalExtracted} words in total, {results.newWords.length} new words not in the dictionary
            </CardDescription>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="outline">{results.newWords.length} New Words</Badge>
                <Badge variant="outline">{results.existingWords} Existing Words</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="new-words">
              <TabsList className="mb-4">
                <TabsTrigger value="new-words">New Words</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="new-words">
                <div className="mb-4">
                  <Input
                    placeholder="Search words..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <ScrollArea className="h-[400px] rounded-md border p-4">
                  {filteredWords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No words found matching your search</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredWords.map((word, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`word-${index}`} className="font-medium">
                                {word.term}
                              </Label>
                              <Badge variant="outline" className="ml-2">
                                {word.frequency}×
                              </Badge>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => openAddWordDialog(word)}>
                                  {userId ? "Add to Dictionary" : "Login Required"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add "{word.term}" to Dictionary</DialogTitle>
                                  <DialogDescription>
                                    {userId
                                      ? "Provide a definition and optional comment for this word."
                                      : "You must be logged in to add words to the dictionary."}
                                  </DialogDescription>
                                </DialogHeader>
                                {userId ? (
                                  <>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="definition">Definition</Label>
                                        <Textarea
                                          id="definition"
                                          placeholder="Enter the definition..."
                                          value={definition}
                                          onChange={(e) => setDefinition(e.target.value)}
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="comment">Comment (Optional)</Label>
                                        <Textarea
                                          id="comment"
                                          placeholder="Add any notes or context about this word..."
                                          value={comment}
                                          onChange={(e) => setComment(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={addWordToDictionary} disabled={!definition || addingWord}>
                                        {addingWord ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding...
                                          </>
                                        ) : (
                                          "Add to Dictionary"
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </>
                                ) : (
                                  <DialogFooter>
                                    <Button asChild>
                                      <a href="/auth/login">Login</a>
                                    </Button>
                                  </DialogFooter>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                          <p className="text-sm text-muted-foreground pl-6">Context: "{word.context}"</p>
                          {index < filteredWords.length - 1 && <Separator className="my-2" />}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="statistics">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Total Words</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{results.totalExtracted}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">New Words</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{results.newWords.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Dictionary Coverage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {Math.round((results.existingWords / results.totalExtracted) * 100)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Most Frequent New Words</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[...results.newWords]
                          .sort((a, b) => b.frequency - a.frequency)
                          .slice(0, 10)
                          .map((word, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>{word.term}</span>
                              <Badge variant="outline">{word.frequency}×</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

