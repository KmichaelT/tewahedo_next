// scripts/debug-env.ts
import * as dotenv from "dotenv"
import { resolve } from "path"

// Try multiple env file locations
const envFiles = [
  ".env.local",
  ".env",
  ".env.development.local",
  ".env.development"
]

console.log("🔍 Debugging Environment Variables\n")
console.log("Current directory:", process.cwd())
console.log("NODE_ENV:", process.env.NODE_ENV)

// Try to load each env file
for (const file of envFiles) {
  const path = resolve(process.cwd(), file)
  console.log(`\nTrying to load: ${path}`)
  const result = dotenv.config({ path })
  if (result.error) {
    console.log(`  ❌ Failed:`, result.error.message)
  } else {
    console.log(`  ✅ Loaded successfully`)
    break
  }
}

console.log("\n📋 Environment Variables Status:")
console.log("================================")

const requiredVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET"
]

for (const varName of requiredVars) {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName}: NOT SET`)
  } else if (value.trim() === "") {
    console.log(`⚠️  ${varName}: EMPTY STRING`)
  } else {
    // Mask sensitive data
    let displayValue = value
    if (varName.includes("SECRET") || varName.includes("PASSWORD")) {
      displayValue = value.substring(0, 4) + "****" + value.substring(value.length - 4)
    } else if (varName === "DATABASE_URL") {
      // Show database type and host only
      const match = value.match(/postgresql:\/\/.*?@(.*?)\//)
      displayValue = match ? `postgresql://****@${match[1]}/****` : "Invalid format"
    } else {
      displayValue = value.substring(0, 20) + (value.length > 20 ? "..." : "")
    }
    console.log(`✅ ${varName}: ${displayValue}`)
  }
}

// Test database URL format
console.log("\n🔍 DATABASE_URL Validation:")
console.log("==========================")
const dbUrl = process.env.DATABASE_URL

if (dbUrl) {
  try {
    const url = new URL(dbUrl)
    console.log("✅ Valid URL format")
    console.log(`  Protocol: ${url.protocol}`)
    console.log(`  Host: ${url.hostname}`)
    console.log(`  Port: ${url.port || "(default)"}`)
    console.log(`  Database: ${url.pathname.substring(1)}`)
    console.log(`  SSL Mode: ${url.searchParams.get("sslmode") || "not specified"}`)
    
    if (!url.searchParams.get("sslmode")) {
      console.log("⚠️  WARNING: No sslmode specified. Add ?sslmode=require for production")
    }
  } catch (error) {
    console.log("❌ Invalid DATABASE_URL format:", error)
  }
} else {
  console.log("❌ DATABASE_URL is not set")
}

console.log("\n💡 Next Steps:")
console.log("=============")
if (!process.env.DATABASE_URL) {
  console.log("1. Make sure your .env.local file exists in the root directory")
  console.log("2. Check that DATABASE_URL is properly formatted")
  console.log("3. Example format: postgresql://user:password@host:5432/dbname?sslmode=require")
}