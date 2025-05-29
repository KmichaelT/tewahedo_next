import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// Create a singleton database instance
let dbInstance: ReturnType<typeof drizzle> | null = null

// Get or create database connection
function getDb() {
  if (!dbInstance) {
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl || databaseUrl.trim() === "") {
      console.error("DATABASE_URL is not defined or is empty")
      return null
    }
    
    try {
      const sql = neon(databaseUrl, {
        fetchOptions: {
          cache: "no-store",
        },
      })
      
      dbInstance = drizzle(sql, { schema })
      console.log("Database connection created successfully")
    } catch (error) {
      console.error("Failed to create database connection:", error)
      return null
    }
  }
  
  return dbInstance
}

// Export the database instance directly (not as a function)
export const db = getDb()

// Export all the Drizzle query helpers you'll need
export { eq, and, or, desc, asc, sql, ilike } from "drizzle-orm"

// Export all schema tables for easy access
export const { users, questions, answers, comments, likes } = schema

// Helper to check if database is available
export function isDatabaseAvailable(): boolean {
  return db !== null
}

// Test database connection
export async function testDbConnection(): Promise<boolean> {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("DATABASE_URL not available for testing")
    return false
  }
  
  try {
    console.log("Testing database connection...")
    const sql = neon(databaseUrl)
    const result = await sql`SELECT 1 as test`
    console.log("✅ Database connection test successful:", result)
    return true
  } catch (error) {
    console.error("❌ Database connection test failed:", error)
    return false
  }
}

// Helper for API routes to ensure database is available
export function requireDatabase() {
  if (!db) {
    throw new Error("Database connection not available")
  }
  return db
}

// Validate all required environment variables
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET", 
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET"
  ]
  
  const missing = required.filter(key => !process.env[key] || process.env[key]!.trim() === "")
  
  return {
    valid: missing.length === 0,
    missing
  }
}