"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, ThumbsUp, MessageSquare } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock dictionary entries
  const dictionaryEntries = [
    {
      id: 1,
      word: "Marhaba",
      phonetic: "/marˈħaba/",
      partOfSpeech: "noun",
      definition: "A greeting; hello",
      example: "Marhaba, kifak?",
      contributor: "Ahmed",
      likes: 24,
      comments: 3,
    },
    {
      id: 2,
      word: "Zein",
      phonetic: "/zeɪn/",
      partOfSpeech: "adjective",
      definition: "Good, beautiful, or fine",
      example: "Hadha zein.",
      contributor: "Fatima",
      likes: 18,
      comments: 5,
    },
    {
      id: 3,
      word: "Meshkoor",
      phonetic: "/meʃˈkuːr/",
      partOfSpeech: "adjective",
      definition: "Thanked; expression of gratitude",
      example: "Meshkoor ala musaadatak.",
      contributor: "Mohammed",
      likes: 12,
      comments: 2,
    },
  ]

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Hassaniya Dictionary</h1>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for a word..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add New Word
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Words</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
            <TabsTrigger value="popular">Most Popular</TabsTrigger>
            <TabsTrigger value="challenge">1000 Words Challenge</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {dictionaryEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{entry.word}</CardTitle>
                      <CardDescription>
                        {entry.phonetic} • {entry.partOfSpeech}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">Contributed by {entry.contributor}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">Definition:</h4>
                      <p>{entry.definition}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Example:</h4>
                      <p className="italic">{entry.example}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex gap-4">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ThumbsUp className="h-4 w-4" /> {entry.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" /> {entry.comments}
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recent">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Select the "Recent" tab to view recently added words.</p>
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Select the "Popular" tab to view the most popular words.</p>
            </div>
          </TabsContent>

          <TabsContent value="challenge">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Select the "Challenge" tab to view words from the 1000 Words Challenge.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

