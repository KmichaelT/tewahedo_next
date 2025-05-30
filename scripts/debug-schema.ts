// scripts/debug-schema.ts
import { neon } from "@neondatabase/serverless"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function debugSchema() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log("🔍 Database Schema Debug")
    console.log("========================\n")
    
    // Check all tables
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    
    console.log("📋 Available Tables:")
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`)
    })
    
    // Check users table schema in detail
    console.log("\n👤 Users Table Schema:")
    console.log("=====================")
    const userSchema = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `
    
    if (userSchema.length === 0) {
      console.log("❌ Users table not found!")
    } else {
      userSchema.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
        const maxLength = col.character_maximum_length ? ` (${col.character_maximum_length})` : ''
        console.log(`   ${col.column_name}: ${col.data_type}${maxLength} ${nullable}${defaultVal}`)
      })
    }
    
    // Check questions table schema
    console.log("\n❓ Questions Table Schema:")
    console.log("=========================")
    const questionSchema = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'questions' 
      ORDER BY ordinal_position
    `
    
    questionSchema.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
      console.log(`   ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`)
    })
    
    // Check answers table schema
    console.log("\n💬 Answers Table Schema:")
    console.log("========================")
    const answerSchema = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'answers' 
      ORDER BY ordinal_position
    `
    
    answerSchema.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
      console.log(`   ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`)
    })
    
    // Check foreign key constraints
    console.log("\n🔗 Foreign Key Constraints:")
    console.log("===========================")
    const foreignKeys = await sql`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name
    `
    
    foreignKeys.forEach(fk => {
      console.log(`   ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`)
    })
    
    // Test a simple insertion to identify the exact issue
    console.log("\n🧪 Testing Simple User Insertion:")
    console.log("=================================")
    
    try {
      // First, let's try to understand what fields are required
      const testUserId = 'test-user-123'
      
      // Try inserting with minimal fields
      await sql`
        INSERT INTO users (id, email) 
        VALUES (${testUserId}, 'test@example.com')
      `
      console.log("✅ Basic insertion successful")
      
      // Clean up test data
      await sql`DELETE FROM users WHERE id = ${testUserId}`
      console.log("🧹 Test data cleaned up")
      
    } catch (error) {
      console.log("❌ Basic insertion failed:", error)
      
      // Try to identify which fields are causing issues
      console.log("\n🔍 Analyzing required fields...")
      
      const notNullColumns = userSchema
        .filter(col => col.is_nullable === 'NO' && !col.column_default)
        .map(col => col.column_name)
      
      console.log("Required fields (NOT NULL, no default):")
      notNullColumns.forEach(col => console.log(`   - ${col}`))
    }
    
  } catch (error) {
    console.error("❌ Schema debug failed:", error)
    process.exit(1)
  }
}

debugSchema()