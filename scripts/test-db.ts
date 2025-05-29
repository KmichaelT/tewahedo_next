import { testDbConnection } from "@/lib/db"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function testConnection() {
  console.log("🔍 Testing database connection...")
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)
  console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET)
  console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID)
  console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET)
  
  const isConnected = await testDbConnection()
  
  if (isConnected) {
    console.log("✅ All systems operational!")
  } else {
    console.log("❌ Database connection failed")
    process.exit(1)
  }
}

testConnection()