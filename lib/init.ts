// lib/init.ts
import * as dotenv from "dotenv"
import { resolve } from "path"

// Initialize environment variables before anything else
export function initializeApp() {
  // Only load dotenv in development
  if (process.env.NODE_ENV !== "production") {
    const result = dotenv.config({ 
      path: resolve(process.cwd(), ".env.local") 
    })
    
    if (result.error) {
      console.error("Failed to load .env.local:", result.error)
    } else {
      console.log("✅ Loaded environment variables from .env.local")
    }
  }
  
  // Validate critical environment variables
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET"]
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error(`❌ Missing critical environment variables: ${missing.join(", ")}`)
    console.error("Please check your .env.local file")
  }
}

// Run initialization
initializeApp()