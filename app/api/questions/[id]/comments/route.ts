import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { comments } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const questionId = Number.parseInt(id)

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const db = requireDatabase()
    const commentsList = await db
      .select()
      .from(comments)
      .where(eq(comments.questionId, questionId))
      .orderBy(comments.createdAt)

    return NextResponse.json(commentsList)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}