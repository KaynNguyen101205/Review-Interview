import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes that don't require authentication
        const isPublicRoute =
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/login") ||
          req.nextUrl.pathname.startsWith("/companies") ||
          req.nextUrl.pathname.startsWith("/reviews") ||
          req.nextUrl.pathname.startsWith("/request-company") ||
          req.nextUrl.pathname.startsWith("/api/companies") ||
          req.nextUrl.pathname.startsWith("/api/reviews") ||
          req.nextUrl.pathname.startsWith("/api/auth")

        if (isPublicRoute) {
          return true
        }

        // Protected routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/me/:path*",
    "/reviews/new",
    "/reviews/:id/edit",
    // Don't include /login in matcher - it's a public route
  ],
}

