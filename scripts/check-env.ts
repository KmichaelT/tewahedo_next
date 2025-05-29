// scripts/check-env.ts
import * as fs from "fs"
import * as path from "path"

const REQUIRED_VARS = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID", 
  "GOOGLE_CLIENT_SECRET"
]

console.log("🔍 Checking Environment Setup")
console.log("============================\n")

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local")
const envExists = fs.existsSync(envPath)

if (!envExists) {
  console.log("❌ .env.local file not found!")
  console.log("\n📝 Creating .env.local template...\n")
  
  const template = `# Database Configuration
# Get your database URL from Neon (https://neon.tech) or Supabase (https://supabase.com)
DATABASE_URL=

# NextAuth Configuration
# Generate secret with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Google OAuth Configuration
# Get from Google Cloud Console (https://console.cloud.google.com)
# 1. Create a new project or select existing
# 2. Enable Google+ API
# 3. Create OAuth 2.0 credentials
# 4. Add authorized redirect URIs:
#    - http://localhost:3000/api/auth/callback/google (for development)
#    - https://your-app.vercel.app/api/auth/callback/google (for production)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
`

  fs.writeFileSync(envPath, template)
  console.log("✅ Created .env.local with template")
  console.log("\n📋 Next steps:")
  console.log("1. Fill in the DATABASE_URL from your database provider")
  console.log("2. Generate NEXTAUTH_SECRET with: openssl rand -base64 32")
  console.log("3. Add Google OAuth credentials from Google Cloud Console")
  console.log("\nThen run this script again to verify your setup.")
  process.exit(0)
}

// Read and parse .env.local
console.log("✅ Found .env.local file\n")

const envContent = fs.readFileSync(envPath, "utf-8")
const envVars: Record<string, string> = {}

// Parse env file
envContent.split("\n").forEach(line => {
  line = line.trim()
  if (line && !line.startsWith("#")) {
    const [key, ...valueParts] = line.split("=")
    if (key) {
      envVars[key.trim()] = valueParts.join("=").trim()
    }
  }
})

// Check each required variable
console.log("📋 Environment Variables Check:")
console.log("==============================")

let allValid = true

for (const varName of REQUIRED_VARS) {
  const value = envVars[varName]
  
  if (!value || value === "") {
    console.log(`❌ ${varName}: NOT SET`)
    allValid = false
  } else {
    let displayValue = "SET"
    
    // Validate format for specific variables
    if (varName === "DATABASE_URL") {
      if (value.startsWith("postgresql://") || value.startsWith("postgres://")) {
        displayValue = "✓ Valid PostgreSQL URL"
      } else {
        displayValue = "⚠️  Invalid format (should start with postgresql://)"
        allValid = false
      }
    } else if (varName === "NEXTAUTH_SECRET") {
      if (value.length < 32) {
        displayValue = "⚠️  Too short (should be at least 32 characters)"
        allValid = false
      } else {
        displayValue = "✓ Valid secret"
      }
    } else if (varName === "GOOGLE_CLIENT_ID") {
      if (value.endsWith(".apps.googleusercontent.com")) {
        displayValue = "✓ Valid Google Client ID"
      } else {
        displayValue = "⚠️  Invalid format"
        allValid = false
      }
    }
    
    console.log(`✅ ${varName}: ${displayValue}`)
  }
}

console.log("\n📊 Summary:")
console.log("===========")

if (allValid) {
  console.log("✅ All environment variables are properly configured!")
  console.log("\n🚀 You can now run:")
  console.log("   npm run dev        - Start development server")
  console.log("   npm run db:migrate - Run database migrations")
} else {
  console.log("❌ Some environment variables need attention")
  console.log("\n💡 Tips:")
  console.log("- DATABASE_URL: Get from your database provider (Neon/Supabase)")
  console.log("- NEXTAUTH_SECRET: Generate with 'openssl rand -base64 32'")
  console.log("- Google OAuth: Set up at https://console.cloud.google.com")
}

// Check for common issues
console.log("\n🔍 Common Issues Check:")
console.log("======================")

if (envVars.DATABASE_URL && !envVars.DATABASE_URL.includes("sslmode")) {
  console.log("⚠️  DATABASE_URL missing sslmode - add ?sslmode=require for production")
}

if (envVars.NEXTAUTH_URL && envVars.NEXTAUTH_URL !== "http://localhost:3000") {
  console.log("⚠️  NEXTAUTH_URL is not set to localhost - make sure this matches your dev environment")
}