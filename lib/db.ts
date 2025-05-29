import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// Don't validate at module load time - wait until first use
let db: ReturnType<typeof drizzle> | null = null
let connectionAttempted = false

// Create database connection lazily
function getDb() {
  if (!connectionAttempted) {
    connectionAttempted = true
    
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl || databaseUrl.trim() === "") {
      console.error("DATABASE_URL is not defined or is empty")
      
      // Log all env vars for debugging (without values)
      console.log("Available environment variables:", Object.keys(process.env).filter(key => 
        key.includes("DATABASE") || 
        key.includes("NEXTAUTH") || 
        key.includes("GOOGLE")
      ))
      
      return null
    }
    
    try {
      console.log("Attempting database connection...")
      const sql = neon(databaseUrl, {
        fetchOptions: {
          cache: "no-store",
        },
      })
      
      db = drizzle(sql, { schema })
      console.log("Database connection created successfully")
    } catch (error) {
      console.error("Failed to create database connection:", error)
      db = null
    }
  }
  
  return db
}

// Export a getter instead of the db directly
export { getDb as db }

// Helper to check if database is available
export function isDatabaseAvailable(): boolean {
  return getDb() !== null
}

// Test database connection
export async function testDbConnection(): Promise<boolean> {
  const database = getDb()
  
  if (!database) {
    console.error("No database instance available")
    return false
  }
  
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
  const database = getDb()
  if (!database) {
    throw new Error("Database connection not available")
  }
  return database
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