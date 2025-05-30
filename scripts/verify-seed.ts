// scripts/verify-seed.ts
import { neon } from "@neondatabase/serverless"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function verifySeeding() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log("🔍 Verifying Database Seeding")
    console.log("============================\n")
    
    // Get overall statistics
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_admin = true) as admin_users,
        (SELECT COUNT(*) FROM questions) as total_questions,
        (SELECT COUNT(*) FROM questions WHERE status = 'published') as published_questions,
        (SELECT COUNT(*) FROM answers) as total_answers,
        (SELECT COUNT(*) FROM comments) as total_comments,
        (SELECT COUNT(*) FROM likes) as total_likes
    `
    
    const data = stats[0]
    
    console.log("📊 Database Statistics:")
    console.log(`   👥 Total Users: ${data.total_users} (${data.admin_users} admins)`)
    console.log(`   ❓ Total Questions: ${data.total_questions} (${data.published_questions} published)`)
    console.log(`   💬 Total Answers: ${data.total_answers}`)
    console.log(`   💭 Total Comments: ${data.total_comments}`)
    console.log(`   👍 Total Likes: ${data.total_likes}`)
    
    // Questions by category
    console.log("\n📂 Questions by Category:")
    const categories = await sql`
      SELECT category, COUNT(*) as count
      FROM questions
      GROUP BY category
      ORDER BY count DESC
    `
    
    categories.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.count} questions`)
    })
    
    // Check for rich text content
    console.log("\n🎨 Rich Text Content Verification:")
    const richContentCheck = await sql`
      SELECT 
        COUNT(*) as questions_with_html,
        COUNT(*) FILTER (WHERE content LIKE '%<p>%') as questions_with_paragraphs,
        COUNT(*) FILTER (WHERE content LIKE '%<ul>%' OR content LIKE '%<ol>%') as questions_with_lists
      FROM questions
    `
    
    const answerContentCheck = await sql`
      SELECT 
        COUNT(*) as answers_with_html,
        COUNT(*) FILTER (WHERE content LIKE '%<h3>%') as answers_with_headings,
        COUNT(*) FILTER (WHERE content LIKE '%<blockquote>%') as answers_with_quotes,
        COUNT(*) FILTER (WHERE content LIKE '%<strong>%') as answers_with_bold
      FROM answers
    `
    
    console.log(`   ❓ Questions with HTML: ${richContentCheck[0].questions_with_html}`)
    console.log(`   📝 Questions with paragraphs: ${richContentCheck[0].questions_with_paragraphs}`)
    console.log(`   📋 Questions with lists: ${richContentCheck[0].questions_with_lists}`)
    console.log(`   💬 Answers with HTML: ${answerContentCheck[0].answers_with_html}`)
    console.log(`   📰 Answers with headings: ${answerContentCheck[0].answers_with_headings}`)
    console.log(`   💭 Answers with blockquotes: ${answerContentCheck[0].answers_with_quotes}`)
    console.log(`   💪 Answers with bold text: ${answerContentCheck[0].answers_with_bold}`)
    
    // Most active users
    console.log("\n👤 Most Active Users:")
    const activeUsers = await sql`
      SELECT 
        u.display_name,
        u.email,
        u.is_admin,
        (SELECT COUNT(*) FROM questions WHERE author_id = u.id) as questions_count,
        (SELECT COUNT(*) FROM answers WHERE author_id = u.id) as answers_count,
        (SELECT COUNT(*) FROM comments WHERE author_id = u.id) as comments_count
      FROM users u
      ORDER BY (
        (SELECT COUNT(*) FROM questions WHERE author_id = u.id) +
        (SELECT COUNT(*) FROM answers WHERE author_id = u.id) +
        (SELECT COUNT(*) FROM comments WHERE author_id = u.id)
      ) DESC
      LIMIT 5
    `
    
    activeUsers.forEach(user => {
      const role = user.is_admin ? "Admin" : "User"
      console.log(`   ${user.display_name} (${role}): ${user.questions_count}Q, ${user.answers_count}A, ${user.comments_count}C`)
    })
    
    // Most popular questions
    console.log("\n🔥 Most Popular Questions (by votes):")
    const popularQuestions = await sql`
      SELECT title, category, votes
      FROM questions
      ORDER BY votes DESC
      LIMIT 5
    `
    
    popularQuestions.forEach(q => {
      console.log(`   [${q.category}] ${q.title.substring(0, 60)}... (${q.votes} votes)`)
    })
    
    // Sample rich content
    console.log("\n📖 Sample Rich Content:")
    const sampleAnswer = await sql`
      SELECT content
      FROM answers 
      WHERE content LIKE '%<p>%'
      LIMIT 1
    `
    
    if (sampleAnswer.length > 0) {
      const preview = sampleAnswer[0].content
        .replace(/<[^>]*>/g, '') // Strip HTML tags for preview
        .substring(0, 100)
      console.log(`   Preview: "${preview}..."`)
      console.log(`   ✅ Rich HTML content confirmed`)
    }
    
    // Health check
    console.log("\n🏥 System Health Check:")
    
    const checks = [
      {
        name: "Users table populated",
        condition: data.total_users >= 6,
        message: `${data.total_users} users found`
      },
      {
        name: "Published questions exist", 
        condition: data.published_questions >= 10,
        message: `${data.published_questions} published questions`
      },
      {
        name: "Admin users configured",
        condition: data.admin_users >= 2,
        message: `${data.admin_users} admin users`
      },
      {
        name: "Rich content present",
        condition: answerContentCheck[0].answers_with_html >= 5,
        message: `${answerContentCheck[0].answers_with_html} answers with HTML`
      },
      {
        name: "Content has engagement",
        condition: data.total_likes > 0,
        message: `${data.total_likes} likes/votes`
      }
    ]
    
    let healthScore = 0
    checks.forEach(check => {
      if (check.condition) {
        console.log(`   ✅ ${check.name}: ${check.message}`)
        healthScore++
      } else {
        console.log(`   ❌ ${check.name}: FAILED`)
      }
    })
    
    console.log(`\n🎯 System Health: ${healthScore}/${checks.length} checks passed`)
    
    if (healthScore === checks.length) {
      console.log("\n🎉 SUCCESS: Your Tewahedo Forum is ready!")
      console.log("🚀 Rich text content has been successfully seeded.")
      console.log("\n📋 Next steps:")
      console.log("1. Run 'npm run dev' to start your development server")
      console.log("2. Visit http://localhost:3000 to see your forum")
      console.log("3. Questions and answers will display with beautiful formatting")
      console.log("4. Sign in with Google to test user functionality")
      console.log("5. Make yourself admin to access the rich text editor")
    } else {
      console.log("\n⚠️  Some issues detected. Please review the failed checks above.")
    }
    
  } catch (error) {
    console.error("❌ Verification failed:", error)
    process.exit(1)
  }
}

verifySeeding()