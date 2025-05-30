// lib/auth.ts
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db, users, eq } from "./db"

const ADMIN_EMAILS = ["kmichaeltb@gmail.com"]
const BLOCKED_ADMIN_EMAILS = ["kmichaelbekele@gmail.com"]

// Helper function to ensure user exists in database
export async function ensureUserExists(userData: {
  id: string
  email: string
  name?: string | null
  image?: string | null
}): Promise<{ 
  id: string
  email: string
  name?: string | null
  image?: string | null
  isAdmin: boolean
}> {
  if (!db) return { ...userData, isAdmin: false }

  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userData.id))
      .limit(1)

    if (existingUser.length === 0) {
      // Create new user
      const isAdmin = ADMIN_EMAILS.includes(userData.email) && 
                     !BLOCKED_ADMIN_EMAILS.includes(userData.email)
      
      console.log(`Creating user in database: ${userData.email}`)
      
      const newUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name || null,
        displayName: userData.name || userData.email.split('@')[0],
        image: userData.image || null,
        photoURL: userData.image || null,
        isAdmin,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await db.insert(users).values(newUser)
      console.log(`✅ Created user in database: ${userData.email}`)
      
      return { ...userData, isAdmin }
    } else {
      // Update existing user info
      await db
        .update(users)
        .set({
          name: userData.name || existingUser[0].name,
          displayName: userData.name || existingUser[0].displayName,
          image: userData.image || existingUser[0].image,
          photoURL: userData.image || existingUser[0].photoURL,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        
      return { ...userData, isAdmin: existingUser[0].isAdmin || false }
    }
  } catch (error) {
    console.error("Error ensuring user exists:", error)
    return { ...userData, isAdmin: false }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.error("No email provided by Google")
        return false
      }
      
      try {
        console.log(`🔍 Sign in attempt: ${user.email}`)
        
        // Ensure user exists in database
        await ensureUserExists({
          id: user.id || `google_${Date.now()}`,
          email: user.email,
          name: user.name,
          image: user.image
        })
        
        return true
      } catch (error) {
        console.error("❌ Error during sign in:", error)
        return false
      }
    },
    
    async jwt({ token, user }) {
      // On initial sign in, user object is available
      if (user?.email) {
        // Ensure user exists and get current data
        const userData = await ensureUserExists({
          id: user.id || token.sub || `google_${Date.now()}`,
          email: user.email,
          name: user.name,
          image: user.image
        })
        
        token.id = userData.id
        token.isAdmin = userData.isAdmin
        token.name = userData.name
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string || token.sub as string
        session.user.isAdmin = !!token.isAdmin
        if (token.name) {
          session.user.name = token.name as string
        }
        
        // Double-check user exists in database
        if (session.user.email) {
          await ensureUserExists({
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image
          })
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}