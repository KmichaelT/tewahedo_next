// lib/auth.ts
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db, users, eq } from "./db"

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
      
      // Skip database operations if no connection
      if (!db) {
        console.warn("Database not available, allowing sign-in without persistence")
        return true
      }
      
      try {
        console.log(`🔍 Checking user: ${user.email}`)
        
        // Check if user exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1)

        if (existingUser.length === 0) {
          // Create new user
          const isAdmin = ADMIN_EMAILS.includes(user.email) && 
                         !BLOCKED_ADMIN_EMAILS.includes(user.email)
          
          console.log(`📝 Creating new user: ${user.email}, admin: ${isAdmin}`)
          
          const newUser = {
            id: user.id || `google_${Date.now()}`,
            email: user.email,
            name: user.name || null,
            displayName: user.name || user.email.split('@')[0],
            image: user.image || null,
            photoURL: user.image || null,
            isAdmin,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          await db.insert(users).values(newUser)
          console.log(`✅ Created user: ${user.email}`)
          
        } else {
          // Update existing user info
          console.log(`📝 Updating existing user: ${user.email}`)
          
          const updateData = {
            name: user.name || existingUser[0].name,
            displayName: user.name || existingUser[0].displayName || user.email.split('@')[0],
            image: user.image || existingUser[0].image,
            photoURL: user.image || existingUser[0].photoURL,
            updatedAt: new Date(),
          }
          
          await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, existingUser[0].id))
            
          console.log(`✅ Updated user: ${user.email}`)
        }
        
        return true
      } catch (error) {
        console.error("❌ Error during sign in:", error)
        
        // Check if it's a database schema issue
        if (error instanceof Error && error.message.includes('column') && error.message.includes('does not exist')) {
          console.error("\n🚨 DATABASE SCHEMA ERROR:")
          console.error("The database table structure doesn't match the expected schema.")
          console.error("Please run: npm run fix:auth-db")
          console.error("Or check your database migration.\n")
        }
        
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
        if (db) {
          try {
            const dbUser = await db
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
            // Use fallback values
            token.id = user.id || `user_${Date.now()}`
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