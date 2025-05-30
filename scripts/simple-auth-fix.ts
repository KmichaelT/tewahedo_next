// scripts/simple-auth-fix.ts
import { neon } from "@neondatabase/serverless"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function simpleAuthFix() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in environment variables")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log("🔧 Adding missing columns to users table...")
    
    // Add the missing 'name' column
    console.log("Adding 'name' column...")
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`
    console.log("✅ Added 'name' column")
    
    // Add the missing 'image' column  
    console.log("Adding 'image' column...")
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT`
    console.log("✅ Added 'image' column")
    
    // Verify the fix
    console.log("\n🔍 Verifying table structure...")
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    console.log("\n📋 Current users table columns:")
    columns.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
    })
    
    // Check for required columns
    const columnNames = columns.map((col: any) => col.column_name)
    const requiredColumns = ['id', 'email', 'name', 'display_name', 'image', 'photo_url', 'is_admin', 'created_at', 'updated_at']
    
    console.log("\n✅ Column verification:")
    let allPresent = true
    for (const reqCol of requiredColumns) {
      const present = columnNames.includes(reqCol)
      console.log(`   ${present ? '✅' : '❌'} ${reqCol}`)
      if (!present) allPresent = false
    }
    
    if (allPresent) {
      console.log("\n🎉 SUCCESS! All required columns are now present.")
      console.log("🚀 You can now restart your dev server: npm run dev")
      console.log("🔐 Try signing in with Google - it should work now!")
    } else {
      console.log("\n⚠️  Some columns are still missing. You may need to run the full migration.")
    }
    
  } catch (error: any) {
    console.error("❌ Failed to fix database:", error)
    console.log("\n💡 Troubleshooting:")
    
    if (error.message.includes('permission')) {
      console.log("   - Check if your database user has ALTER TABLE permissions")
    } else if (error.message.includes('does not exist')) {
      console.log("   - The users table might not exist. Run: npm run db:migrate")
    } else {
      console.log("   - Check your DATABASE_URL connection")
      console.log("   - Ensure your database is accessible")
    }
    
    process.exit(1)
  }
}

simpleAuthFix()