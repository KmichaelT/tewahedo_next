import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function rateLimit(identifier: string, limit: number = 10, window: number = 60000) {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + window
    })
    return true
  }
  
  if (userLimit.count >= limit) {
    return false
  }
  
  userLimit.count++
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and auth endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next()
  }

  try {
    // Get token for auth checks
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Apply rate limiting to API routes
    if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
      const identifier = token?.email || request.ip || "anonymous"
      const limit = pathname.startsWith("/api/admin") ? 30 : 60 // Higher limit for admin
      
      if (!rateLimit(identifier, limit)) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        )
      }
    }

    // Protect admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (!token) {
        const signInUrl = new URL("/auth/signin", request.url)
        signInUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(signInUrl)
      }

      if (!token.isAdmin) {
        return pathname.startsWith("/api/admin")
          ? NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
          : NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Protect authenticated routes
    const protectedRoutes = ["/ask", "/api/questions", "/api/answers", "/api/comments"]
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    // Allow GET requests to /api/questions without auth
    const isPublicRead = pathname === "/api/questions" && request.method === "GET"
    
    if (isProtectedRoute && !isPublicRead) {
      if (!token) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          )
        }
        
        const signInUrl = new URL("/auth/signin", request.url)
        signInUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(signInUrl)
      }
    }

    // Add security headers
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    
    return response
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

// Clean up old rate limit entries periodically
if (typeof global !== 'undefined' && !(global as any).rateLimitCleanup) {
  (global as any).rateLimitCleanup = setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }, 60000) // Clean every minute
}