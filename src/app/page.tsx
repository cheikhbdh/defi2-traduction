import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Book, Users, Award, FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      <main className="flex-1">
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Dictionnaire Collaboratif Hassaniya</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Rejoignez notre effort communautaire pour documenter, préserver et enrichir la langue Hassaniya grâce à des contributions collaboratives.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="gap-2">
                Explorer le Dictionnaire <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                Contribuer <Users className="h-4 w-4" />
              </Button>
            </div>
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
                  Contribuez avec de nouveaux mots, modifiez les entrées existantes et aidez à construire un dictionnaire Hassaniya complet.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Suggestions par IA</h3>
                <p className="text-muted-foreground">
                  Obtenez des suggestions générées par IA pour les conjugaisons, dérivations et formes grammaticales des mots.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Récompenses des Contributeurs</h3>
                <p className="text-muted-foreground">
                  Gagnez des points et des badges pour vos contributions et suivez votre progression sur le tableau des leaders.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Défi des 1000 Mots Racines</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Participez à notre initiative spéciale pour documenter les 1000 mots racines les plus utilisés en Hassaniya.
            </p>
            <div className="bg-card p-8 rounded-lg max-w-md mx-auto">
              <div className="mb-4">
                <div className="h-4 bg-primary rounded-full">
                  <div className="h-4 bg-primary/30 rounded-full w-[35%]"></div>
                </div>
              </div>
              <p className="font-semibold">350 sur 1000 mots documentés</p>
              <Button className="mt-4">Contribuer au Défi</Button>
            </div>
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
                Conditions d'Utilisation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}