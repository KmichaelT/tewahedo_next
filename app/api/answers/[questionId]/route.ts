// app/api/answers/[questionId]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { answers, users } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params
    const questionIdNum = Number.parseInt(questionId)

    if (isNaN(questionIdNum)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const db = requireDatabase()
    const answersList = await db
      .select({
        id: answers.id,
        content: answers.content,
        questionId: answers.questionId,
        authorId: answers.authorId,
        votes: answers.votes,
        isAccepted: answers.isAccepted,
        createdAt: answers.createdAt,
        updatedAt: answers.updatedAt,
        // Author information from users table
        authorName: users.name,
        authorDisplayName: users.displayName,
        authorImage: users.image,
        authorIsAdmin: users.isAdmin,
      })
      .from(answers)
      .leftJoin(users, eq(answers.authorId, users.id))
      .where(eq(answers.questionId, questionIdNum))
      .orderBy(answers.createdAt)

    return NextResponse.json(answersList)
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 })
  }
}