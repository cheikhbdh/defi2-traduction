"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, ThumbsUp, MessageSquare, CheckCircle, XCircle, Edit, Trash2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

type DictionaryEntry = {
  id: number
  term: string
  phonetic?: string
  partOfSpeech?: string
  definition: string
  example?: string
  contributor?: string
  contributor_id?: string
  likes?: number
  comments?: number
  status: string
  created_at: string
}

export default function DictionaryPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [isApproving, setIsApproving] = useState<number | null>(null)
  const [isRejecting, setIsRejecting] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  useEffect(() => {
    // Récupérer le rôle de l'utilisateur et les entrées du dictionnaire
    const fetchUserAndEntries = async () => {
      setIsLoading(true)
      try {
        // Récupérer le profil utilisateur pour obtenir le rôle
        const profileResponse = await fetch("/api/profile")
        const profileData = await profileResponse.json()

        if (profileResponse.ok) {
          setUserRole(profileData.role)
        } else {
          console.error("Erreur lors de la récupération du profil:", profileData.error)
        }

        // Récupérer les entrées du dictionnaire
        const entriesResponse = await fetch("/api/words")
        const entriesData = await entriesResponse.json()

        if (entriesResponse.ok) {
          setEntries(entriesData.words || [])
        } else {
          console.error("Erreur lors de la récupération des mots:", entriesData.error)
          toast.error("Impossible de charger les mots du dictionnaire")
        }
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Une erreur est survenue lors du chargement des données")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndEntries()
  }, [])

  const handleAddWord = () => {
    router.push("/contribute")
  }

  const handleApproveWord = async (id: number) => {
    if (!["moderateur", "admin"].includes(userRole || "")) {
      toast.error("Vous n'avez pas les droits pour approuver des mots")
      return
    }

    setIsApproving(id)
    try {
      const response = await fetch(`/api/words/${id}/approve`, {
        method: "PUT",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Le mot a été approuvé avec succès")
        setEntries(entries.map((entry) => (entry.id === id ? { ...entry, status: "approved" } : entry)))
      } else {
        throw new Error(data.error || "Une erreur est survenue")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsApproving(null)
    }
  }

  const handleRejectWord = async (id: number) => {
    if (!["moderateur", "admin"].includes(userRole || "")) {
      toast.error("Vous n'avez pas les droits pour rejeter des mots")
      return
    }

    setIsRejecting(id)
    try {
      const response = await fetch(`/api/words/${id}/reject`, {
        method: "PUT",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Le mot a été rejeté")
        setEntries(entries.map((entry) => (entry.id === id ? { ...entry, status: "rejected" } : entry)))
      } else {
        throw new Error(data.error || "Une erreur est survenue")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsRejecting(null)
    }
  }

  const handleDeleteWord = async (id: number) => {
    if (userRole !== "admin") {
      toast.error("Seuls les administrateurs peuvent supprimer des mots")
      return
    }

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/words/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Le mot a été supprimé avec succès")
        setEntries(entries.filter((entry) => entry.id !== id))
      } else {
        throw new Error(data.error || "Une erreur est survenue")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleEditWord = (id: number) => {
    router.push(`/contribute?edit=${id}`)
  }

  const handleViewDetails = (id: number) => {
    router.push(`/dictionary/${id}`)
  }

  const filteredEntries = entries.filter(
    (entry) =>
      entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.definition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approuvé</Badge>
      case "en_attente":
        return <Badge className="bg-amber-500">En attente</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejeté</Badge>
      case "review":
        return <Badge className="bg-blue-500">En révision</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dictionnaire Hassaniya</h1>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un mot..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {userRole && (
            <Button className="gap-2" onClick={handleAddWord}>
              <Plus className="h-4 w-4" /> Ajouter un nouveau mot
            </Button>
          )}
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tous les mots</TabsTrigger>
            <TabsTrigger value="recent">Récemment ajoutés</TabsTrigger>
            <TabsTrigger value="pending">
              En attente {userRole === "moderateur" || userRole === "admin" ? "(Modération)" : ""}
            </TabsTrigger>
            {userRole === "admin" && <TabsTrigger value="admin">Administration</TabsTrigger>}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun mot trouvé.</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-2xl">{entry.term}</CardTitle>
                          {getStatusBadge(entry.status)}
                        </div>
                        <CardDescription>
                          {entry.phonetic && `${entry.phonetic} • `}
                          {entry.partOfSpeech}
                        </CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ajouté le {formatDate(entry.created_at)}
                        {entry.contributor && ` par ${entry.contributor}`}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-1">Définition:</h4>
                        <p>{entry.definition}</p>
                      </div>
                      {entry.example && (
                        <div>
                          <h4 className="font-semibold mb-1">Exemple:</h4>
                          <p className="italic">{entry.example}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex gap-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="h-4 w-4" /> {entry.likes || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageSquare className="h-4 w-4" /> {entry.comments || 0}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(entry.id)}>
                        <Eye className="h-4 w-4 mr-2" /> Détails
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              entries
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 10)
                .map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-2xl">{entry.term}</CardTitle>
                            {getStatusBadge(entry.status)}
                          </div>
                          <CardDescription>
                            {entry.phonetic && `${entry.phonetic} • `}
                            {entry.partOfSpeech}
                          </CardDescription>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Ajouté le {formatDate(entry.created_at)}
                          {entry.contributor && ` par ${entry.contributor}`}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-1">Définition:</h4>
                          <p>{entry.definition}</p>
                        </div>
                        {entry.example && (
                          <div>
                            <h4 className="font-semibold mb-1">Exemple:</h4>
                            <p className="italic">{entry.example}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex gap-4">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <ThumbsUp className="h-4 w-4" /> {entry.likes || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageSquare className="h-4 w-4" /> {entry.comments || 0}
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(entry.id)}>
                        <Eye className="h-4 w-4 mr-2" /> Détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              entries
                .filter((entry) => entry.status === "en_attente")
                .map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-2xl">{entry.term}</CardTitle>
                            {getStatusBadge(entry.status)}
                          </div>
                          <CardDescription>
                            {entry.phonetic && `${entry.phonetic} • `}
                            {entry.partOfSpeech}
                          </CardDescription>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Ajouté le {formatDate(entry.created_at)}
                          {entry.contributor && ` par ${entry.contributor}`}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-1">Définition:</h4>
                          <p>{entry.definition}</p>
                        </div>
                        {entry.example && (
                          <div>
                            <h4 className="font-semibold mb-1">Exemple:</h4>
                            <p className="italic">{entry.example}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      {userRole === "moderateur" || userRole === "admin" ? (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproveWord(entry.id)}
                            disabled={isApproving === entry.id}
                          >
                            {isApproving === entry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectWord(entry.id)}
                            disabled={isRejecting === entry.id}
                          >
                            {isRejecting === entry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Rejeter
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <ThumbsUp className="h-4 w-4" /> {entry.likes || 0}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageSquare className="h-4 w-4" /> {entry.comments || 0}
                          </Button>
                        </div>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(entry.id)}>
                        <Eye className="h-4 w-4 mr-2" /> Détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </TabsContent>

          {userRole === "admin" && (
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Administration du dictionnaire</CardTitle>
                  <CardDescription>Gérez tous les mots du dictionnaire</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {entries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{entry.term}</p>
                              <p className="text-sm text-muted-foreground">Ajouté le {formatDate(entry.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(entry.status)}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditWord(entry.id)}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirmer la suppression</DialogTitle>
                                  <DialogDescription>
                                    Êtes-vous sûr de vouloir supprimer le mot &quot;{entry.term}&quot; ? Cette action ne peut pas
                                    être annulée.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">Annuler</Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteWord(entry.id)}
                                    disabled={isDeleting === entry.id}
                                  >
                                    {isDeleting === entry.id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Suppression...
                                      </>
                                    ) : (
                                      "Supprimer"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
  )
}