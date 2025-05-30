// app/api/questions/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { questions, answers, comments, users } from "@/lib/schema"
import { desc, eq, sql, and, or, ilike } from "drizzle-orm"
import { z } from "zod"

// Input validation schema
const createQuestionSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(5000),
  category: z.enum(["Faith", "Practices", "Theology", "History", "General"]),
})

export async function GET(request: NextRequest) {
  try {
    const database = requireDatabase()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const status = searchParams.get("status") || "published"

    const whereConditions = [eq(questions.status, status as any)]

    if (search) {
      whereConditions.push(
        or(
          ilike(questions.title, `%${search}%`),
          ilike(questions.content, `%${search}%`)
        )!
      )
    }

    if (category && category !== "all") {
      whereConditions.push(eq(questions.category, category as any))
    }

    const questionsWithCounts = await database
      .select({
        id: questions.id,
        title: questions.title,
        content: questions.content,
        authorId: questions.authorId,
        status: questions.status,
        category: questions.category,
        votes: questions.votes,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        author: users.name,
        authorDisplayName: users.displayName,
        authorImage: users.image,
        answerCount: sql<number>`cast(count(distinct ${answers.id}) as int)`,
        commentCount: sql<number>`cast(count(distinct ${comments.id}) as int)`,
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(answers, eq(questions.id, answers.questionId))
      .leftJoin(comments, eq(questions.id, comments.questionId))
      .where(and(...whereConditions))
      .groupBy(questions.id, users.name, users.displayName, users.image)
      .orderBy(desc(questions.createdAt))

    return NextResponse.json(questionsWithCounts)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const database = requireDatabase()

    const body = await request.json()
    const validationResult = createQuestionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid input", 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      )
    }

    const { title, content, category } = validationResult.data

    // Check if user exists in database, if not create them
    const existingUser = await database
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (existingUser.length === 0) {
      // Create the user if they don't exist
      console.log(`Creating missing user: ${session.user.email}`)
      
      const newUser = {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name || null,
        displayName: session.user.name || session.user.email?.split('@')[0] || "Anonymous",
        image: session.user.image || null,
        photoURL: session.user.image || null,
        isAdmin: session.user.isAdmin || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await database.insert(users).values(newUser)
      console.log(`✅ Created missing user: ${session.user.email}`)
    }

    // Now create the question
    const [newQuestion] = await database
      .insert(questions)
      .values({
        title,
        content,
        category,
        authorId: session.user.id,
        status: "pending",
      })
      .returning()

    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    )
  }
}