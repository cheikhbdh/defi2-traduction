import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if we're on a protected route
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/contributy") ||
    req.nextUrl.pathname.startsWith("/dictionary")

  // For admin routes, check if user has admin role
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")

  if (isProtectedRoute) {
    // If no session, redirect to login
    if (!session) {
      const redirectUrl = new URL("/auth/login", req.url)
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    if (isAdminRoute) {
      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", session.user.email)
        .single()

      if (error || !userData || userData.role !== "admin") {
        // User is not an admin, redirect to home
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/admin/:path*", "/contributy/:path*", "/dictionary/:path*"],
}

