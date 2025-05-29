import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db, isDatabaseAvailable } from "@/lib/db"
import { questions, answers } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"
import { z } from "zod"

// Input validation schemas
const updateQuestionSchema = z.object({
  status: z.enum(["pending", "published", "rejected"]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      )
    }

    // Validate question ID
    const questionId = Number.parseInt(params.id)
    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateQuestionSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { status } = validationResult.data

    // Update question status with transaction
    const result = await db!.transaction(async (tx) => {
      // Update question status
      const [updatedQuestion] = await tx
        .update(questions)
        .set({ 
          status,
          updatedAt: new Date() 
        })
        .where(eq(questions.id, questionId))
        .returning()

      if (!updatedQuestion) {
        throw new Error("Question not found")
      }

      // Log if publishing a question with answers
      if (status === "published") {
        const [answerCount] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(answers)
          .where(eq(answers.questionId, questionId))

        if (answerCount.count > 0) {
          console.log(`Question ${questionId} published with ${answerCount.count} existing answers`)
        }
      }

      return updatedQuestion
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error updating question:", error)
    
    if (error instanceof Error && error.message === "Question not found") {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      )
    }

    const questionId = Number.parseInt(params.id)
    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      )
    }
    
    // Delete with cascade (answers, comments, likes will be deleted automatically)
    const deletedRows = await db!
      .delete(questions)
      .where(eq(questions.id, questionId))
      .returning({ id: questions.id })

    if (deletedRows.length === 0) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Question and related content deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    )
  }
}