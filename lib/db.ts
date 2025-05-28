import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// Only initialize database if DATABASE_URL is available
let db: any = null

if (process.env.DATABASE_URL) {
  try {
    const sql = neon(process.env.DATABASE_URL)
    db = drizzle(sql, { schema })
  } catch (error) {
    console.error("Database initialization failed:", error)
  }
}

export { db }

// Test database connection
export async function testDbConnection() {
  if (!db || !process.env.DATABASE_URL) {
    console.log("Database not configured - using in-memory storage")
    return false
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    await sql`SELECT 1`
    console.log("Database connection successful")
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}
