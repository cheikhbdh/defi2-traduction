import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Book, Users, Award, FileText } from "lucide-react"

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">

      <main className="flex-1">
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Collaborative Hassaniya Dictionary</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join our community effort to document, preserve, and enrich the Hassaniya language through collaborative
              contributions.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="gap-2">
                Explore Dictionary <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                Contribute <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Collaborative Dictionary</h3>
                <p className="text-muted-foreground">
                  Contribute new words, edit existing entries, and help build a comprehensive Hassaniya dictionary.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Suggestions</h3>
                <p className="text-muted-foreground">
                  Get AI-generated suggestions for word conjugations, derivations, and grammatical forms.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Contributor Rewards</h3>
                <p className="text-muted-foreground">
                  Earn points and badges for your contributions and track your progress on the leaderboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">1000 Root Words Challenge</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join our special initiative to document the 1000 most commonly used root words in Hassaniya.
            </p>
            <div className="bg-card p-8 rounded-lg max-w-md mx-auto">
              <div className="mb-4">
                <div className="h-4 bg-primary rounded-full">
                  <div className="h-4 bg-primary/30 rounded-full w-[35%]"></div>
                </div>
              </div>
              <p className="font-semibold">350 of 1000 words documented</p>
              <Button className="mt-4">Contribute to the Challenge</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 Hassaniya Dictionary Project</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:underline">
                About
              </Link>
              <Link href="#" className="hover:underline">
                Contact
              </Link>
              <Link href="#" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

