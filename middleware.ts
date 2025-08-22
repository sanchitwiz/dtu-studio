import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Allow access to login page
    if (pathname === "/login") {
      return NextResponse.next()
    }

    // Redirect to login if not authenticated
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Force password change if required (except for change-password page)
    if (token.forcePasswordChange && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", req.url))
    }

    // Admin-only routes
    if (pathname.startsWith("/admin") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/schedule", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow login page without token
        if (pathname === "/login") {
          return true
        }

        // Require token for all other protected routes
        return !!token
      },
    },
  },
)

export const config = {
  matcher: ["/schedule/:path*", "/my-bookings/:path*", "/admin/:path*", "/change-password", "/login"],
}
