import { neon } from "@neondatabase/serverless"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in environment variables")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log("🚀 Starting database migration...")
    
    // Create tables if they don't exist
    console.log("Creating users table...")
    await sql`
      CREATE TABLE IF NOT EXISTS users (
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
    
    console.log("Creating questions table...")
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'published', 'rejected')),
        category TEXT NOT NULL CHECK (category IN ('Faith', 'Practices', 'Theology', 'History', 'General')),
        votes INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    
    console.log("Creating answers table...")
    await sql`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        votes INTEGER DEFAULT 0 NOT NULL,
        is_accepted BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    
    console.log("Creating comments table...")
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    
    console.log("Creating likes table...")
    await sql`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer', 'comment')),
        target_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, target_type, target_id)
      )
    `
    
    // Create indexes
    console.log("Creating indexes...")
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id)`
    
    console.log("✅ Migration completed successfully!")
    
    // Verify tables
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    
    console.log("\n📋 Tables in database:")
    tables.forEach(t => console.log(`   - ${t.tablename}`))
    
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

runMigration()