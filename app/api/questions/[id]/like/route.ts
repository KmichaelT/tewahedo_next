// app/api/questions/[id]/like/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { questions, likes } from "@/lib/schema"
import { eq, and, sql } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const questionId = Number.parseInt(id)

    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      )
    }

    const db = requireDatabase()
    const session = await getServerSession(authOptions)

    // Get like count and user's like status
    const result = await db
      .select({
        likeCount: sql<number>`cast(count(${likes.id}) as int)`,
        isLiked: session?.user?.id 
          ? sql<boolean>`count(case when ${likes.userId} = ${session.user.id} then 1 end) > 0`
          : sql<boolean>`false`,
      })
      .from(likes)
      .where(
        and(
          eq(likes.targetType, "question"),
          eq(likes.targetId, questionId)
        )
      )

    return NextResponse.json(result[0] || { likeCount: 0, isLiked: false })
  } catch (error) {
    console.error("Error getting question likes:", error)
    return NextResponse.json(
      { error: "Failed to get question likes" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = await params
    const questionId = Number.parseInt(id)

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const db = requireDatabase()
    
    // Check if question exists
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1)

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.userId, session.user.id), 
        eq(likes.targetType, "question"), 
        eq(likes.targetId, questionId)
      ))
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

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = await params
    const questionId = Number.parseInt(id)

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const db = requireDatabase()
    
    // Remove like
    const deletedLikes = await db
      .delete(likes)
      .where(and(
        eq(likes.userId, session.user.id), 
        eq(likes.targetType, "question"), 
        eq(likes.targetId, questionId)
      ))
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