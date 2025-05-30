// scripts/fix-auth-db.ts
import { neon } from "@neondatabase/serverless"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function fixAuthDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in environment variables")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log("🔍 Checking current database schema...")
    
    // Check if users table exists and get its structure
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `
    
    if (!tableExists[0].exists) {
      console.log("📝 Users table doesn't exist. Creating from scratch...")
      await createUsersTable(sql)
    } else {
      console.log("✅ Users table exists. Checking columns...")
      await checkAndFixColumns(sql)
    }
    
    // Verify the final structure
    console.log("\n🔍 Final table structure:")
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    console.log("📋 Users table columns:")
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
    })
    
    console.log("\n✅ Database schema fixed successfully!")
    console.log("🚀 You can now restart your development server: npm run dev")
    
  } catch (error) {
    console.error("❌ Failed to fix database:", error)
    process.exit(1)
  }
}

async function createUsersTable(sql: any) {
  console.log("Creating users table...")
  await sql`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      display_name TEXT,
      image TEXT,
      photo_url TEXT,
      is_admin BOOLEAN DEFAULT false NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `
  
  // Create index
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email)`
  console.log("✅ Users table created")
}

async function checkAndFixColumns(sql: any) {
  const currentColumns = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND table_schema = 'public'
  `
  
  const existingColumns = currentColumns.map((col: any) => col.column_name)
  console.log("Current columns:", existingColumns)
  
  const requiredColumns = [
    { name: 'id', type: 'TEXT', constraint: 'PRIMARY KEY' },
    { name: 'email', type: 'TEXT', constraint: 'NOT NULL UNIQUE' },
    { name: 'name', type: 'TEXT', constraint: '' },
    { name: 'display_name', type: 'TEXT', constraint: '' },
    { name: 'image', type: 'TEXT', constraint: '' },
    { name: 'photo_url', type: 'TEXT', constraint: '' },
    { name: 'is_admin', type: 'BOOLEAN', constraint: 'DEFAULT false NOT NULL' },
    { name: 'created_at', type: 'TIMESTAMP', constraint: 'DEFAULT NOW() NOT NULL' },
    { name: 'updated_at', type: 'TIMESTAMP', constraint: 'DEFAULT NOW() NOT NULL' }
  ]
  
  for (const col of requiredColumns) {
    if (!existingColumns.includes(col.name)) {
      console.log(`Adding missing column: ${col.name}`)
      await sql`ALTER TABLE users ADD COLUMN ${sql(col.name)} ${sql.unsafe(col.type)} ${sql.unsafe(col.constraint)}`
    }
  }
  
  // Ensure email unique constraint exists
  try {
    await sql`ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email)`
    console.log("✅ Added email unique constraint")
  } catch (error) {
    // Constraint might already exist, that's okay
    console.log("ℹ️  Email unique constraint already exists or added")
  }
}

fixAuthDatabase()