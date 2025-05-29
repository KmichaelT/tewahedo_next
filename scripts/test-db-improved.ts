// scripts/test-db-improved.ts
import * as dotenv from "dotenv"
import { resolve } from "path"

// Load environment variables FIRST before any imports
const envPath = resolve(process.cwd(), ".env.local")
const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error("❌ Failed to load .env.local:", result.error)
  console.log("Creating a sample .env.local file for you...")
  
  const fs = require("fs")
  const sampleEnv = `# Database (Get from Neon/Supabase)
DATABASE_URL=postgresql://username:password@host:5432/database_name?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
`
  
  fs.writeFileSync(".env.local", sampleEnv)
  console.log("✅ Created .env.local - Please fill in your actual values")
  process.exit(1)
}

// Now import the database functions
import { testDbConnection, validateEnvironment } from "../lib/db"

async function runTest() {
  console.log("🔍 Environment Configuration Test")
  console.log("=================================\n")
  
  // Check environment variables
  const envCheck = validateEnvironment()
  
  if (!envCheck.valid) {
    console.log("❌ Missing environment variables:")
    envCheck.missing.forEach(varName => {
      console.log(`   - ${varName}`)
    })
    console.log("\n💡 Please add these to your .env.local file")
    process.exit(1)
  }
  
  console.log("✅ All required environment variables are set\n")
  
  // Test database connection
  console.log("🔍 Testing Database Connection")
  console.log("==============================")
  
  const dbUrl = process.env.DATABASE_URL!
  const urlParts = dbUrl.match(/postgresql:\/\/(.*?):(.*?)@(.*?)\/(.*?)\?/)
  
  if (urlParts) {
    console.log(`Host: ${urlParts[3]}`)
    console.log(`Database: ${urlParts[4]}`)
  }
  
  const isConnected = await testDbConnection()
  
  if (isConnected) {
    console.log("\n✅ Database connection successful!")
    
    // Try to run a simple query
    try {
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(process.env.DATABASE_URL!)
      
      // Check if tables exist
      const tables = await sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
      
      console.log("\n📋 Existing tables:")
      if (tables.length === 0) {
        console.log("   No tables found - you need to run migrations")
      } else {
        tables.forEach(table => {
          console.log(`   - ${table.tablename}`)
        })
      }
      
      // Check for users table specifically
      const hasUsersTable = tables.some(t => t.tablename === 'users')
      if (!hasUsersTable) {
        console.log("\n⚠️  Users table not found. Run migration with: npm run db:migrate")
      } else {
        // Count users
        const userCount = await sql`SELECT COUNT(*) as count FROM users`
        console.log(`\n👥 Users in database: ${userCount[0].count}`)
      }
      
    } catch (error) {
      console.error("\n❌ Query error:", error)
    }
  } else {
    console.log("\n❌ Database connection failed")
    console.log("\n💡 Troubleshooting steps:")
    console.log("1. Check if your DATABASE_URL is correct")
    console.log("2. Ensure your database is running and accessible")
    console.log("3. Check if SSL is required (add ?sslmode=require)")
    console.log("4. Verify network connectivity to your database host")
  }
}

runTest().catch(console.error)