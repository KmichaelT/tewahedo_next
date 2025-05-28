import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log("🔍 Middleware executing for path:", request.nextUrl.pathname)

  // Skip middleware for NextAuth API routes and static files
  if (
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon")
  ) {
    console.log("⏭️ Skipping middleware for:", request.nextUrl.pathname)
    return NextResponse.next()
  }

  try {
    // Import getToken dynamically to avoid issues
    const { getToken } = await import("next-auth/jwt")

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    console.log("🔍 Middleware token check:", {
      hasToken: !!token,
      isAdmin: token?.isAdmin,
      path: request.nextUrl.pathname,
    })

    const { pathname } = request.nextUrl

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
      if (!token) {
        console.log("🔒 Redirecting unauthenticated user from admin route")
        return NextResponse.redirect(new URL("/auth/signin?callbackUrl=" + encodeURIComponent(pathname), request.url))
      }

      if (!token.isAdmin) {
        console.log("🚫 Redirecting non-admin user from admin route")
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Protect authenticated routes
    if (pathname.startsWith("/ask")) {
      if (!token) {
        console.log("🔒 Redirecting unauthenticated user from ask route")
        return NextResponse.redirect(new URL("/auth/signin?callbackUrl=" + encodeURIComponent(pathname), request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("❌ Middleware error:", error)
    // Always allow the request to continue if middleware fails
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
}
