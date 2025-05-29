import { neon } from "@neondatabase/serverless"
import * as dotenv from "dotenv"
import { readFileSync } from "fs"
import { join } from "path"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in environment variables")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log("🚀 Starting database migration...")
    
    // Read migration file
    const migrationPath = join(process.cwd(), "drizzle/0001_fix_schema.sql")
    const migrationSQL = readFileSync(migrationPath, "utf-8")
    
    // Split by semicolons and run each statement
    const statements = migrationSQL
      .split(";")
      .filter(stmt => stmt.trim().length > 0)
    
    for (const statement of statements) {
      console.log("Executing:", statement.trim().substring(0, 50) + "...")
      await sql(statement)
    }
    
    console.log("✅ Migration completed successfully!")
    
    // Test the connection
    const result = await sql`SELECT COUNT(*) FROM users`
    console.log("User count:", result[0].count)
    
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

runMigration()