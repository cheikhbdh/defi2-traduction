"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Book, Users, Award, FileText, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Stats = {
  totalWords: number
  approvedWords: number
  pendingWords: number
  uniqueContributors: number
  recentWords: Array<{
    id: number
    term: string
    definition: string
    created_at: string
  }>
  topContributors: Array<{
    user_id: string
    name: string
    points: number
    badges: string[]
  }>
  challenge: {
    total: number
    completed: number
    percentage: number
  }
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/public/stats")
        const data = await response.json()

        if (response.ok) {
          setStats(data)
        } else {
          console.error("Erreur lors de la récupération des statistiques:", data.error)
        }
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Dictionnaire Collaboratif Hassaniya</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Rejoignez notre effort communautaire pour documenter, préserver et enrichir la langue Hassaniya grâce à
              des contributions collaboratives.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/dictionary">
                  Explorer le Dictionnaire <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link href="/contribute">
                  Contribuer <Users className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section des statistiques */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Statistiques du Dictionnaire</h2>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">{stats.totalWords}</p>
                      <p className="text-muted-foreground mt-2">Mots au total</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">{stats.approvedWords}</p>
                      <p className="text-muted-foreground mt-2">Mots approuvés</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">{stats.pendingWords}</p>
                      <p className="text-muted-foreground mt-2">Mots en attente</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">{stats.uniqueContributors}</p>
                      <p className="text-muted-foreground mt-2">Contributeurs</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Impossible de charger les statistiques</p>
            )}
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Fonctionnalités Clés</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Dictionnaire Collaboratif</h3>
                <p className="text-muted-foreground">
                  Contribuez avec de nouveaux mots, modifiez les entrées existantes et aidez à construire un
                  dictionnaire Hassaniya complet.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Suggestions par IA</h3>
                <p className="text-muted-foreground">
                  Obtenez des suggestions générées par IA pour les conjugaisons, dérivations et formes grammaticales des
                  mots.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Récompenses des Contributeurs</h3>
                <p className="text-muted-foreground">
                  Gagnez des points et des badges pour vos contributions et suivez votre progression sur le tableau des
                  leaders.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Défi des 1000 Mots Racines</h2>
                <p className="text-xl mb-8">
                  Participez à notre initiative spéciale pour documenter les 1000 mots racines les plus utilisés en
                  Hassaniya.
                </p>
                <div className="bg-card p-8 rounded-lg">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : stats ? (
                    <>
                      <div className="mb-4">
                        <div className="h-4 bg-primary/30 rounded-full">
                          <div
                            className="h-4 bg-primary rounded-full"
                            style={{ width: `${stats.challenge.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="font-semibold">
                        {stats.challenge.completed} sur {stats.challenge.total} mots documentés
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/contribute">Contribuer au Défi</Link>
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Impossible de charger les données du défi</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Mots Récemment Ajoutés</h2>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : stats && stats.recentWords.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentWords.map((word) => (
                      <Card key={word.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{word.term}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{word.definition}</p>
                            </div>
                            <Badge variant="outline">{formatDate(word.created_at)}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="text-center mt-4">
                      <Button variant="outline" asChild>
                        <Link href="/dictionary">Voir tous les mots</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Aucun mot récent à afficher</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section des top contributeurs */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Top Contributeurs</h2>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : stats && stats.topContributors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {stats.topContributors.map((contributor, index) => (
                  <Card key={contributor.user_id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{contributor.name}</p>
                          <p className="text-muted-foreground">{contributor.points} points</p>
                          <div className="flex gap-1 mt-1">
                            {contributor.badges &&
                              contributor.badges.map((badge, i) => (
                                <Badge key={i} variant="outline">
                                  {badge}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Aucun contributeur à afficher</p>
            )}

            <Button className="mt-8" variant="outline" asChild>
              <Link href="/leaderboard">Voir le tableau des leaders complet</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 Projet du Dictionnaire Hassaniya</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:underline">
                À propos
              </Link>
              <Link href="#" className="hover:underline">
                Contact
              </Link>
              <Link href="#" className="hover:underline">
                Politique de Confidentialité
              </Link>
              <Link href="#" className="hover:underline">
                Conditions d&apos;Utilisation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

