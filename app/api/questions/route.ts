import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { questions, answers, comments, users } from "@/lib/schema"
import { desc, eq, sql, and } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const status = searchParams.get("status") || "published"

    const whereConditions = [eq(questions.status, status)]

    if (search) {
      whereConditions.push(
        sql`${questions.title} ILIKE ${`%${search}%`} OR ${questions.content} ILIKE ${`%${search}%`}`,
      )
    }

    if (category && category !== "all") {
      whereConditions.push(eq(questions.category, category))
    }

    const questionsWithCounts = await db
      .select({
        id: questions.id,
        title: questions.title,
        content: questions.content,
        authorId: questions.authorId,
        status: questions.status,
        category: questions.category,
        likes: questions.likes,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        author: users.name,
        authorImage: users.image,
        answerCount: sql<number>`cast(count(distinct ${answers.id}) as int)`,
        commentCount: sql<number>`cast(count(distinct ${comments.id}) as int)`,
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(answers, eq(questions.id, answers.questionId))
      .leftJoin(comments, eq(questions.id, comments.questionId))
      .where(and(...whereConditions))
      .groupBy(questions.id, users.name, users.image)
      .orderBy(desc(questions.createdAt))

    return NextResponse.json(questionsWithCounts)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, category } = body

    if (!title || !content || !category) {
      return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 })
    }

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
