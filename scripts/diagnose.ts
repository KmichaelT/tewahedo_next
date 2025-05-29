// scripts/diagnose.ts
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

console.log("🏥 Tewahedo Answers - System Diagnostics")
console.log("======================================\n")

// Step 1: Check file system
console.log("📁 Step 1: Checking project structure")
console.log("------------------------------------")

const requiredFiles = [
  ".env.local",
  "lib/db.ts",
  "lib/auth.ts",
  "lib/schema.ts",
  "package.json"
]

let filesOk = true
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(process.cwd(), file))
  console.log(`${exists ? "✅" : "❌"} ${file}`)
  if (!exists) filesOk = false
}

if (!filesOk) {
  console.log("\n❌ Missing required files. Please ensure all files are present.")
  process.exit(1)
}

// Step 2: Load and check environment variables
console.log("\n\n🔑 Step 2: Loading environment variables")
console.log("--------------------------------------")

const envPath = path.join(process.cwd(), ".env.local")
const result = dotenv.config({ path: envPath })

if (result.error) {
  console.log("❌ Failed to load .env.local:", result.error.message)
  process.exit(1)
} else {
  console.log("✅ Successfully loaded .env.local")
}

// Step 3: Validate environment variables
console.log("\n\n✅ Step 3: Validating environment variables")
console.log("------------------------------------------")

const envChecks = [
  {
    name: "DATABASE_URL",
    check: (val: string) => val.startsWith("postgresql://") || val.startsWith("postgres://"),
    error: "Must start with postgresql:// or postgres://"
  },
  {
    name: "NEXTAUTH_SECRET",
    check: (val: string) => val.length >= 32,
    error: "Must be at least 32 characters long"
  },
  {
    name: "GOOGLE_CLIENT_ID",
    check: (val: string) => val.endsWith(".apps.googleusercontent.com"),
    error: "Must end with .apps.googleusercontent.com"
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    check: (val: string) => val.length > 0,
    error: "Must not be empty"
  }
]

let envValid = true
for (const { name, check, error } of envChecks) {
  const value = process.env[name]
  if (!value) {
    console.log(`❌ ${name}: NOT SET`)
    envValid = false
  } else if (!check(value)) {
    console.log(`❌ ${name}: INVALID - ${error}`)
    envValid = false
  } else {
    console.log(`✅ ${name}: Valid`)
  }
}

if (!envValid) {
  console.log("\n❌ Environment validation failed. Please fix the issues above.")
  process.exit(1)
}

// Step 4: Test database connection
console.log("\n\n🗄️  Step 4: Testing database connection")
console.log("--------------------------------------")

async function testDatabase() {
  try {
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(process.env.DATABASE_URL!)
    
    console.log("Attempting to connect...")
    const result = await sql`SELECT version()`
    console.log("✅ Connected successfully!")
    console.log(`   PostgreSQL version: ${result[0].version.split(',')[0]}`)
    
    // Check tables
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    
    console.log(`\n   Found ${tables.length} tables:`)
    const expectedTables = ['users', 'questions', 'answers', 'comments', 'likes']
    
    for (const tableName of expectedTables) {
      const exists = tables.some(t => t.tablename === tableName)
      console.log(`   ${exists ? "✅" : "❌"} ${tableName}`)
    }
    
    if (tables.length === 0) {
      console.log("\n⚠️  No tables found. You need to run migrations:")
      console.log("   npm run db:migrate")
    }
    
    return true
  } catch (error: any) {
    console.log("❌ Connection failed:", error.message)
    
    if (error.message.includes("password authentication failed")) {
      console.log("\n💡 Invalid credentials. Check your DATABASE_URL")
    } else if (error.message.includes("could not connect")) {
      console.log("\n💡 Cannot reach database. Check:")
      console.log("   - Database is running")
      console.log("   - Network connectivity")
      console.log("   - Firewall/security group settings")
    } else if (error.message.includes("SSL")) {
      console.log("\n💡 SSL issue. Make sure your DATABASE_URL includes ?sslmode=require")
    }
    
    return false
  }
}

// Step 5: Test the lazy-loaded database module
console.log("\n\n🔧 Step 5: Testing database module")
console.log("---------------------------------")

async function testDbModule() {
  try {
    // Clear module cache to force reload
    delete require.cache[require.resolve("../lib/db")]
    
    const { db, isDatabaseAvailable, testDbConnection } = await import("../lib/db")
    
    console.log("✅ Database module loaded")
    console.log(`   isDatabaseAvailable: ${isDatabaseAvailable()}`)
    
    const connected = await testDbConnection()
    console.log(`   testDbConnection: ${connected ? "✅ Success" : "❌ Failed"}`)
    
    return connected
  } catch (error: any) {
    console.log("❌ Database module error:", error.message)
    return false
  }
}

// Run all tests
async function runDiagnostics() {
  const dbConnected = await testDatabase()
  
  if (dbConnected) {
    await testDbModule()
  }
  
  // Final summary
  console.log("\n\n📊 Diagnostic Summary")
  console.log("====================")
  
  if (dbConnected) {
    console.log("✅ System is ready!")
    console.log("\n🚀 Next steps:")
    console.log("1. Run migrations if needed: npm run db:migrate")
    console.log("2. Start development server: npm run dev")
  } else {
    console.log("❌ System has issues that need to be fixed")
    console.log("\n💡 Please resolve the database connection issues above")
  }
}

runDiagnostics().catch(console.error)