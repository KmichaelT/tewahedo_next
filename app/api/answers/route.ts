import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { answers, questions } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { questionId, content } = body

    if (!questionId || !content) {
      return NextResponse.json({ error: "Question ID and content are required" }, { status: 400 })
    }

    // Verify question exists
    const [question] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1)

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const [newAnswer] = await db
      .insert(answers)
      .values({
        questionId,
        content,
        authorId: session.user.id,
      })
      .returning()

    return NextResponse.json(newAnswer, { status: 201 })
  } catch (error) {
    console.error("Error creating answer:", error)
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 })
  }
}