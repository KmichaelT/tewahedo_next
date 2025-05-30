import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { questions, answers } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

// Input validation schema
const answerQuestionSchema = z.object({
  content: z.string().min(10).max(10000),
  category: z.string().optional(),
  tags: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const { id } = await params
    const questionId = Number.parseInt(id)

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const body = await request.json()
    const validationResult = answerQuestionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid input", 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      )
    }

    const { content } = validationResult.data
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

    // Check if question already has an answer from an admin
    const [existingAnswer] = await db
      .select()
      .from(answers)
      .where(eq(answers.questionId, questionId))
      .limit(1)

    // Create or update the answer first
    let answerResult
    if (existingAnswer) {
      // Update existing answer
      [answerResult] = await db
        .update(answers)
        .set({
          content,
          updatedAt: new Date(),
        })
        .where(eq(answers.id, existingAnswer.id))
        .returning()
    } else {
      // Create new answer
      [answerResult] = await db
        .insert(answers)
        .values({
          content,
          questionId,
          authorId: session.user.id,
          isAccepted: true, // Admin answers are automatically accepted
        })
        .returning()
    }

    // Auto-publish the question when admin answers (regardless of current status)
    const [updatedQuestion] = await db
      .update(questions)
      .set({
        status: "published",
        updatedAt: new Date(),
      })
      .where(eq(questions.id, questionId))
      .returning()

    const result = { answer: answerResult, question: updatedQuestion }

    return NextResponse.json({
      message: existingAnswer ? "Answer updated and question published" : "Answer created and question published",
      answer: result.answer,
      question: result.question,
    }, { status: existingAnswer ? 200 : 201 })

  } catch (error) {
    console.error("Error submitting answer:", error)
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 })
  }
}

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
    
    // Get existing answer for this question (if any)
    const existingAnswers = await db
      .select()
      .from(answers)
      .where(eq(answers.questionId, questionId))
      .orderBy(answers.createdAt)

    return NextResponse.json(existingAnswers)
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 })
  }
}