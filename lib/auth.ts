import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from "./db"
import { users } from "./schema"
import { eq } from "drizzle-orm"

const ADMIN_EMAILS = ["kmichaeltb@gmail.com"]
const BLOCKED_ADMIN_EMAILS = ["kmichaeltbekele@gmail.com"]

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
      
      // Get database instance
      const database = db()
      
      // Skip database operations if no connection
      if (!database) {
        console.warn("Database not available, allowing sign-in without persistence")
        return true
      }
      
      try {
        // Check if user exists
        const existingUser = await database
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1)

        if (existingUser.length === 0) {
          // Create new user
          const isAdmin = ADMIN_EMAILS.includes(user.email) && 
                         !BLOCKED_ADMIN_EMAILS.includes(user.email)
          
          console.log(`Creating new user: ${user.email}, admin: ${isAdmin}`)
          
          await database.insert(users).values({
            id: user.id,
            email: user.email,
            name: user.name || null,
            displayName: user.name || user.email.split('@')[0],
            image: user.image || null,
            photoURL: user.image || null,
            isAdmin,
          })
        } else {
          // Update existing user info
          console.log(`Updating existing user: ${user.email}`)
          
          await database
            .update(users)
            .set({
              name: user.name || existingUser[0].name,
              displayName: user.name || existingUser[0].displayName || existingUser[0].email.split('@')[0],
              image: user.image || existingUser[0].image,
              photoURL: user.image || existingUser[0].photoURL,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser[0].id))
        }
        
        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return false
      }
    },
    
    async jwt({ token, user }) {
      // On initial sign in, user object is available
      if (user?.email) {
        // Set admin status for known admin emails (fallback)
        if (ADMIN_EMAILS.includes(user.email) && !BLOCKED_ADMIN_EMAILS.includes(user.email)) {
          token.isAdmin = true
        }
        
        // Try to fetch from database for accurate info
        const database = db()
        if (database) {
          try {
            const dbUser = await database
              .select()
              .from(users)
              .where(eq(users.email, user.email))
              .limit(1)
            
            if (dbUser.length > 0) {
              token.id = dbUser[0].id
              token.isAdmin = dbUser[0].isAdmin
              token.name = dbUser[0].displayName || dbUser[0].name || user.name
            }
          } catch (error) {
            console.error("Error fetching user in JWT callback:", error)
          }
        }
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string || token.sub as string
        session.user.isAdmin = !!token.isAdmin
        if (token.name) {
          session.user.name = token.name as string
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