"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Book, LogOut, Settings, User } from "lucide-react"
import { getCurrentUser, signOut } from "@/lib/auth-utils"

type UserType = {
  id: number
  email: string
  role: string
}

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="bg-primary text-primary-foreground py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Hassaniya Dictionary
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/dictionary"
                className={`hover:text-primary-foreground/80 ${
                  pathname?.startsWith("/dictionary") ? "font-medium" : ""
                }`}
              >
                Dictionary
              </Link>
              <Link
                href="/contributy"
                className={`hover:text-primary-foreground/80 ${
                  pathname?.startsWith("/contribute") ? "font-medium" : ""
                }`}
              >
                Contribute
              </Link>
              <Link
            href="/text-analysic"
            className={`hover:text-primary-foreground/80 ${
              pathname?.startsWith("/text-analysic") ? "font-medium" : ""
            }`}
          >
            Analyse de Texte
          </Link>
          <Link
            href="/word-variants"
            className={`hover:text-primary-foreground/80 ${
              pathname?.startsWith("/word-variants") ? "font-medium" : ""
            }`}
          >
            Variantes de Mots
          </Link>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className={`hover:text-primary-foreground/80 ${pathname?.startsWith("/admin") ? "font-medium" : ""}`}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="h-9 w-24 bg-primary-foreground/20 animate-pulse rounded"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium">
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dictionary")}>
                    <Book className="mr-2 h-4 w-4" />
                    Dictionary
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/admin")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary-foreground/10 text-primary-foreground font-medium transition-colors"
                  onClick={() => router.push("/auth/login")}
                >
                  Login
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium"
                  onClick={() => router.push("/auth/register")}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}