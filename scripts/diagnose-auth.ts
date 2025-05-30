// scripts/diagnose-auth.ts
import * as dotenv from "dotenv"
import { neon } from "@neondatabase/serverless"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function diagnoseAuth() {
  console.log("🔍 Authentication System Diagnosis")
  console.log("==================================\n")
  
  // Step 1: Check Environment Variables
  console.log("📋 Step 1: Environment Variables")
  console.log("--------------------------------")
  
  const envVars = [
    { name: "DATABASE_URL", required: true, mask: true },
    { name: "NEXTAUTH_SECRET", required: true, mask: true },
    { name: "NEXTAUTH_URL", required: false, mask: false },
    { name: "GOOGLE_CLIENT_ID", required: true, mask: false },
    { name: "GOOGLE_CLIENT_SECRET", required: true, mask: true },
  ]
  
  let envOk = true
  for (const { name, required, mask } of envVars) {
    const value = process.env[name]
    
    if (!value) {
      console.log(`❌ ${name}: NOT SET ${required ? "(REQUIRED)" : "(OPTIONAL)"}`)
      if (required) envOk = false
    } else {
      const display = mask 
        ? value.substring(0, 8) + "..." + value.substring(value.length - 4)
        : value
      console.log(`✅ ${name}: ${display}`)
    }
  }
  
  if (!envOk) {
    console.log("\n❌ Missing required environment variables!")
    console.log("Please check your .env.local file")
    return
  }
  
  // Step 2: Test Database Connection  
  console.log("\n\n🗄️  Step 2: Database Connection")
  console.log("-----------------------------")
  
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`SELECT version()`
    console.log("✅ Database connection successful")
    console.log(`   Database: ${result[0].version.split(',')[0]}`)
  } catch (error: any) {
    console.log("❌ Database connection failed:", error.message)
    console.log("\n💡 Troubleshooting:")
    console.log("   - Check your DATABASE_URL format")
    console.log("   - Ensure database is accessible")
    console.log("   - Try adding ?sslmode=require to your DATABASE_URL")
    return
  }
  
  // Step 3: Check Users Table Structure
  console.log("\n\n👥 Step 3: Users Table Structure")
  console.log("-------------------------------")
  
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    // Check if users table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `
    
    if (!tableExists[0].exists) {
      console.log("❌ Users table does not exist!")
      console.log("\n💡 Fix: Run the database migration:")
      console.log("   npm run db:migrate")
      console.log("   OR")
      console.log("   npm run fix:auth-db")
      return
    }
    
    console.log("✅ Users table exists")
    
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    const expectedColumns = [
      'id', 'email', 'name', 'display_name', 'image', 
      'photo_url', 'is_admin', 'created_at', 'updated_at'
    ]
    
    const existingColumns = columns.map((col: any) => col.column_name)
    
    console.log("\n📋 Table columns:")
    for (const col of expectedColumns) {
      const exists = existingColumns.includes(col)
      console.log(`   ${exists ? '✅' : '❌'} ${col}`)
    }
    
    const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col))
    if (missingColumns.length > 0) {
      console.log(`\n❌ Missing columns: ${missingColumns.join(', ')}`)
      console.log("\n💡 Fix: Run the auth database fix:")
      console.log("   npm run fix:auth-db")
      return
    }
    
    // Check data
    const userCount = await sql`SELECT COUNT(*) as count FROM users`
    console.log(`\n📊 Total users: ${userCount[0].count}`)
    
    if (userCount[0].count > 0) {
      const sampleUser = await sql`SELECT id, email, name, display_name, is_admin FROM users LIMIT 1`
      console.log("📝 Sample user:")
      console.log(`   ID: ${sampleUser[0].id}`)
      console.log(`   Email: ${sampleUser[0].email}`)
      console.log(`   Name: ${sampleUser[0].name || 'NULL'}`)
      console.log(`   Display Name: ${sampleUser[0].display_name || 'NULL'}`)
      console.log(`   Is Admin: ${sampleUser[0].is_admin}`)
    }
    
  } catch (error: any) {
    console.log("❌ Error checking users table:", error.message)
    
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log("\n🚨 Column missing error detected!")
      console.log("💡 Fix: Run the auth database fix:")
      console.log("   npm run fix:auth-db")
    }
    return
  }
  
  // Step 4: Test NextAuth Configuration
  console.log("\n\n🔑 Step 4: NextAuth Configuration")
  console.log("--------------------------------")
  
  try {
    // Test Google OAuth configuration
    const clientId = process.env.GOOGLE_CLIENT_ID!
    if (clientId.endsWith('.apps.googleusercontent.com')) {
      console.log("✅ Google Client ID format is valid")
    } else {
      console.log("⚠️  Google Client ID format might be invalid")
    }
    
    const secret = process.env.NEXTAUTH_SECRET!
    if (secret.length >= 32) {
      console.log("✅ NextAuth secret is adequate length")
    } else {
      console.log("⚠️  NextAuth secret should be at least 32 characters")
    }
    
    console.log("\n📍 NextAuth URLs:")
    console.log(`   Base URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`)
    console.log(`   Sign In: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin`)
    console.log(`   Callback: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`)
    
  } catch (error: any) {
    console.log("❌ NextAuth configuration error:", error.message)
  }
  
  // Final Summary
  console.log("\n\n📊 Diagnosis Summary")
  console.log("===================")
  console.log("✅ System appears to be configured correctly!")
  console.log("\n🚀 If you're still having issues:")
  console.log("1. Restart your development server: npm run dev")
  console.log("2. Clear your browser cache and cookies")
  console.log("3. Check the browser console for additional errors")
  console.log("4. Verify your Google OAuth callback URLs in Google Cloud Console")
  
  console.log("\n🔗 Required Google OAuth URLs:")
  console.log("   Development: http://localhost:3000/api/auth/callback/google")
  console.log("   Production: https://your-domain.com/api/auth/callback/google")
}

diagnoseAuth().catch(console.error)