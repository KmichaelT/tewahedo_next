import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { questions, answers, comments, users } from "@/lib/schema"
import { desc, sql, eq } from "drizzle-orm"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allQuestions = await db
      .select({
        id: questions.id,
        title: questions.title,
        content: questions.content,
        authorId: questions.authorId,
        status: questions.status,
        likes: questions.likes,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        author: users.displayName,
        answerCount: sql<number>`cast(count(distinct ${answers.id}) as int)`,
        commentCount: sql<number>`cast(count(distinct ${comments.id}) as int)`,
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(answers, eq(questions.id, answers.questionId))
      .leftJoin(comments, eq(questions.id, comments.questionId))
      .groupBy(questions.id, users.displayName)
      .orderBy(desc(questions.createdAt))

    return NextResponse.json(allQuestions)
  } catch (error) {
    console.error("Error fetching admin questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}
