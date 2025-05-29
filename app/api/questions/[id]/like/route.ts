import { type NextRequest, NextResponse } from "next/server"
import { requireDatabase } from "@/lib/db"
import { questions, likes } from "@/lib/schema"
import { eq, and, sql } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const questionId = Number.parseInt(params.id)

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const db = requireDatabase()
    // Check if already liked
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, session.user.id), eq(likes.targetType, "question"), eq(likes.targetId, questionId)))
      .limit(1)

    if (existingLike.length > 0) {
      return NextResponse.json({ error: "Already liked" }, { status: 400 })
    }

    // Add like
    await db.insert(likes).values({
      userId: session.user.id,
      targetType: "question",
      targetId: questionId,
    })

    // Update question votes count using SQL
    await db
      .update(questions)
      .set({ votes: sql`${questions.votes} + 1` })
      .where(eq(questions.id, questionId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error liking question:", error)
    return NextResponse.json({ error: "Failed to like question" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const questionId = Number.parseInt(params.id)

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const db = requireDatabase()
    // Remove like
    const deletedLikes = await db
      .delete(likes)
      .where(and(eq(likes.userId, session.user.id), eq(likes.targetType, "question"), eq(likes.targetId, questionId)))
      .returning()

    if (deletedLikes.length === 0) {
      return NextResponse.json({ error: "Like not found" }, { status: 404 })
    }

    // Update question votes count using SQL
    await db
      .update(questions)
      .set({ votes: sql`${questions.votes} - 1` })
      .where(eq(questions.id, questionId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unliking question:", error)
    return NextResponse.json({ error: "Failed to unlike question" }, { status: 500 })
  }
}
