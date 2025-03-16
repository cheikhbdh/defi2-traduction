"use client"

import React, { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, hasRole } from "@/lib/auth-utils"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        if (requiredRole && !(await hasRole(requiredRole))) {
          router.push("/")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return React.createElement(
      "div", 
      { className: "flex items-center justify-center min-h-screen" },
      React.createElement(
        "div", 
        { className: "w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" }
      )
    )
  }

  return isAuthorized ? children : null
}