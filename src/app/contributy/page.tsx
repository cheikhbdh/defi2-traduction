"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Clock, Loader2, Trash2, Edit } from "lucide-react"
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
import { ProtectedRoute } from "@/components/protected-route"

type WordFormType = {
  term: string
  definition: string
  partOfSpeech: string
  example: string
}

type ContributionType = {
  id: number
  term: string
  status: string
  created_at: string
  definition: string
}

export default function ContributePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editingWord, setEditingWord] = useState<ContributionType | null>(null)
  const [myContributions, setMyContributions] = useState<ContributionType[]>([])
  const [userLevel, setUserLevel] = useState("Débutant")
  const [userPoints, setUserPoints] = useState(0)
  const [wordForm, setWordForm] = useState<WordFormType>({
    term: "",
    definition: "",
    partOfSpeech: "",
    example: "",
  })

  // Charger les contributions de l'utilisateur
  useEffect(() => {
    const fetchUserContributions = async () => {
      setIsLoading(true)
      try {
  
        const response = await fetch("/api/words/my-words")
        const data = await response.json()

        if (response.ok) {
          setMyContributions(data.words || [])

          const wordCount = data.words?.length || 0
          setUserPoints(wordCount * 5)

          if (wordCount >= 50) {
            setUserLevel("Expert")
          } else if (wordCount >= 20) {
            setUserLevel("Avancé")
          } else if (wordCount >= 5) {
            setUserLevel("Intermédiaire")
          } else {
            setUserLevel("Débutant")
          }
        } else {
          throw new Error(data.error || "Erreur lors de la récupération des contributions")
        }
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Impossible de charger vos contributions. Veuillez réessayer.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserContributions()
  }, [])

  const handleChange = (field: string, value: string) => {
    setWordForm({ ...wordForm, [field]: value })
  }

  const resetForm = () => {
    setWordForm({
      term: "",
      definition: "",
      partOfSpeech: "",
      example: "",
    })
    setEditingWord(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Vérifier les champs obligatoires
      if (!wordForm.term || !wordForm.definition) {
        throw new Error("Le terme et la définition sont obligatoires")
      }

      // Préparer les données à envoyer
      const wordData = {
        term: wordForm.term,
        definition: wordForm.definition,
        part_of_speech: wordForm.partOfSpeech,
        example: wordForm.example,
      }

      let response

      if (editingWord) {
        // Mettre à jour un mot existant
        response = await fetch(`/api/words/${editingWord.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(wordData),
        })
      } else {
        // Créer un nouveau mot
        response = await fetch("/api/words", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(wordData),
        })
      }

      const data = await response.json()

      if (response.ok) {
        toast.success(editingWord ? "Mot mis à jour avec succès" : "Mot ajouté avec succès")

        // Réinitialiser le formulaire
        resetForm()

        // Rafraîchir la liste des contributions
        const refreshResponse = await fetch("/api/words/my-words")
        const refreshData = await refreshResponse.json()

        if (refreshResponse.ok) {
          setMyContributions(refreshData.words || [])

          // Mettre à jour les points et le niveau
          const wordCount = refreshData.words?.length || 0
          setUserPoints(wordCount * 5)

          if (wordCount >= 50) {
            setUserLevel("Expert")
          } else if (wordCount >= 20) {
            setUserLevel("Avancé")
          } else if (wordCount >= 5) {
            setUserLevel("Intermédiaire")
          } else {
            setUserLevel("Débutant")
          }
        }
      } else {
        throw new Error(data.error || "Une erreur s'est produite lors de la soumission")
      }
    } catch (error) {
        if (error instanceof Error) {
            toast.error(error.message || "Une erreur s'est produite. Veuillez réessayer.")
          } else {
            toast.error("Une erreur s'est produite. Veuillez réessayer.")
          }
          setIsLoading(false)
        
   
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (word: ContributionType) => {
    setEditingWord(word)
    setWordForm({
      term: word.term,
      definition: word.definition,
      partOfSpeech: "", // Ces champs ne sont pas dans le type ContributionType
      example: "", // mais nous les incluons dans le formulaire
    })

    // Changer l'onglet actif pour afficher le formulaire
    const addWordTab = document.querySelector('[data-value="add-word"]') as HTMLElement
    if (addWordTab) {
      addWordTab.click()
    }
  }

  const handleDelete = async (id: number) => {
    setIsDeleting(true)
    setDeleteId(id)

    try {
      const response = await fetch(`/api/words/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Mot supprimé avec succès")

        // Mettre à jour la liste des contributions
        setMyContributions(myContributions.filter((word) => word.id !== id))

        // Mettre à jour les points
        setUserPoints((myContributions.length - 1) * 5)
      } else {
        throw new Error(data.error || "Une erreur s'est produite lors de la suppression")
      }
    } catch (error) {
        if (error instanceof Error) {
            toast.error(error.message || "Une erreur s'est produite. Veuillez réessayer.")
          } else {
            toast.error( "Une erreur s'est produite. Veuillez réessayer.")
          }
          setIsLoading(false)
        
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approuvé</Badge>
      case "pending":
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
        <ProtectedRoute requiredRole="contributeur">
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Contribuer au Dictionnaire</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Mon Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                {userLevel.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Niveau: {userLevel}</h3>
                <p className="text-muted-foreground">{userPoints} points</p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-end">
              <p className="text-lg font-semibold">{myContributions.length} mots contribués</p>
              <div className="flex gap-2 mt-2">
                {myContributions.length >= 5 && <Badge className="bg-bronze">Bronze</Badge>}
                {myContributions.length >= 20 && <Badge className="bg-silver">Argent</Badge>}
                {myContributions.length >= 50 && <Badge className="bg-gold">Or</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="add-word">
        <TabsList className="mb-6">
          <TabsTrigger value="add-word">{editingWord ? "Modifier le mot" : "Ajouter un mot"}</TabsTrigger>
          <TabsTrigger value="my-contributions">Mes contributions</TabsTrigger>
        </TabsList>

        <TabsContent value="add-word">
          <Card>
            <CardHeader>
              <CardTitle>{editingWord ? "Modifier un mot Hassaniya" : "Ajouter un nouveau mot Hassaniya"}</CardTitle>
              <CardDescription>
                {editingWord
                  ? "Modifiez les détails du mot ci-dessous."
                  : "Remplissez les détails ci-dessous pour ajouter un nouveau mot au dictionnaire Hassaniya."}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="term">Mot (en Hassaniya)</Label>
                  <Input
                    id="term"
                    value={wordForm.term}
                    onChange={(e) => handleChange("term", e.target.value)}
                    required
                  />
                </div>

               

                <div className="space-y-2">
                  <Label htmlFor="definition">Définition</Label>
                  <Textarea
                    id="definition"
                    value={wordForm.definition}
                    onChange={(e) => handleChange("definition", e.target.value)}
                    placeholder="Fournir une définition claire du mot"
                    required
                  />
                </div>

               
              </CardContent>
              <CardFooter className="flex justify-between">
                {editingWord && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                )}
                <Button type="submit" className={editingWord ? "" : "w-full"} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingWord ? "Mise à jour..." : "Soumission..."}
                    </>
                  ) : (
                    <>{editingWord ? "Mettre à jour" : "Soumettre le mot"}</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="my-contributions">
          <Card>
            <CardHeader>
              <CardTitle>Mes Contributions</CardTitle>
              <CardDescription>Mots que vous avez contribués au dictionnaire.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : myContributions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Vous n&apos;avez pas encore contribué de mots.</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      const addWordTab = document.querySelector('[data-value="add-word"]') as HTMLElement
                      if (addWordTab) {
                        addWordTab.click()
                      }
                    }}
                  >
                    Ajouter votre premier mot
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myContributions.map((contribution) => (
                    <div key={contribution.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {contribution.status === "approved" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {contribution.status === "pending" && <Clock className="h-5 w-5 text-amber-500" />}
                        {contribution.status === "review" && <AlertCircle className="h-5 w-5 text-blue-500" />}
                        <div>
                          <p className="font-medium">{contribution.term}</p>
                          <p className="text-sm text-muted-foreground">
                            Soumis le {formatDate(contribution.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(contribution.status)}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(contribution)} title="Modifier">
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
                                Êtes-vous sûr de vouloir supprimer le mot &quot;{contribution.term} &quot;? Cette action ne peut
                                pas être annulée.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {}}>
                                Annuler
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(contribution.id)}
                                disabled={isDeleting && deleteId === contribution.id}
                              >
                                {isDeleting && deleteId === contribution.id ? (
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
      </Tabs>
    </div>
    </ProtectedRoute>
  )
}

