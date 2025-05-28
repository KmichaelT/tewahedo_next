import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

console.log("🔧 Auth config loading...")
console.log("Environment check:", {
  hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  nodeEnv: process.env.NODE_ENV,
})

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      try {
        if (token.email === "kmichaeltb@gmail.com") {
          token.isAdmin = true
        }
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.sub as string
          session.user.isAdmin = !!token.isAdmin
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
