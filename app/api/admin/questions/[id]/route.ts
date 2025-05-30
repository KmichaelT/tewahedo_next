import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { questions, answers, comments, users } from "@/lib/schema"
import { desc, eq, sql, and, or, ilike } from "drizzle-orm"
import { z } from "zod"

// Input validation schemas
const createQuestionSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(5000),
  category: z.enum(["Faith", "Practices", "Theology", "History", "General"]),
})

const updateQuestionSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(10).max(5000).optional(),
  status: z.enum(["pending", "published", "rejected"]).optional(),
  category: z.enum(["Faith", "Practices", "Theology", "History", "General"]).optional(),
  tags: z.string().optional(),
})

const answerQuestionSchema = z.object({
  content: z.string().min(10).max(10000),
  category: z.string().optional(),
  tags: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const questionId = Number.parseInt(id)

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const db = requireDatabase()
    
    // Get question with author info and counts
    const [question] = await db
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
        answerCount: sql<number>`cast(count(distinct ${answers.id}) as int)`,
        commentCount: sql<number>`cast(count(distinct ${comments.id}) as int)`,
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(answers, eq(questions.id, answers.questionId))
      .leftJoin(comments, eq(questions.id, comments.questionId))
      .where(eq(questions.id, questionId))
      .groupBy(questions.id, users.name, users.displayName)

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const questionId = Number.parseInt(id)

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const body = await request.json()
    const validationResult = updateQuestionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid input", 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      )
    }

    const db = requireDatabase()
    const updateData = {
      ...validationResult.data,
      updatedAt: new Date(),
    }

    const [updatedQuestion] = await db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, questionId))
      .returning()

    if (!updatedQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const questionId = Number.parseInt(id)

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const db = requireDatabase()
    
    // Check if question exists
    const [existingQuestion] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1)

    if (!existingQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Delete the question (cascade will handle answers and comments)
    await db
      .delete(questions)
      .where(eq(questions.id, questionId))

    return NextResponse.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = requireDatabase()
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

    const [newQuestion] = await db
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
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}