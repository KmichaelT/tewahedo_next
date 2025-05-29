// scripts/run-migration.ts
import * as dotenv from "dotenv"
import { readFileSync } from "fs"
import { join } from "path"
import { neon } from "@neondatabase/serverless"

// Load environment variables
dotenv.config({ path: ".env.local" })

/**
 * Splits SQL script into individual statements, preserving dollar-quoted blocks.
 */
function splitSqlStatements(sqlText: string): string[] {
  const statements: string[] = []
  let current = ''
  let inDollar = false
  let dollarTag = ''
  let i = 0
  const len = sqlText.length

  while (i < len) {
    if (!inDollar && sqlText[i] === '$') {
      const rest = sqlText.slice(i)
      const match = rest.match(/^\$[A-Za-z0-9_]*\$/)
      if (match) {
        inDollar = true
        dollarTag = match[0]
        current += match[0]
        i += dollarTag.length
        continue
      }
    }

    if (inDollar && sqlText.slice(i, i + dollarTag.length) === dollarTag) {
      inDollar = false
      current += dollarTag
      i += dollarTag.length
      continue
    }

    const char = sqlText[i]
    if (!inDollar && char === ';') {
      // end of statement
      statements.push(current.trim())
      current = ''
      i++
      continue
    }

    current += char
    i++
  }

  if (current.trim()) {
    statements.push(current.trim())
  }
  return statements
}

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log("🚀 Running database migration...")
    
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), "drizzle/0002_create_likes_table.sql")
    const migrationSQL = readFileSync(migrationPath, "utf-8")
    
    // Split into statements, preserving dollar-quoted blocks
    const statements = splitSqlStatements(migrationSQL)

    // Execute each statement sequentially
    for (const stmt of statements) {
      console.log("▶️ Executing:", stmt.split("\n")[0].slice(0, 60))
      await sql.query(stmt)
    }
    
    console.log("✅ Migration completed successfully!")
    
    // Verify the likes table was created
    const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'likes'
    `
    
    if (tables.length > 0) {
      console.log("✅ Likes table created successfully")
      
      // List all tables in the public schema
      const allTables = await sql`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `
      
      console.log("\n📋 All tables in database:")
      allTables.forEach(t => console.log(`   - ${t.tablename}`))
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

runMigration()
