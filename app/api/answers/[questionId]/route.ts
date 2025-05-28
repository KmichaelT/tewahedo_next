import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { answers } from "@/lib/schema"
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

    const answersList = await db
      .select()
      .from(answers)
      .where(eq(answers.questionId, questionIdNum))
      .orderBy(answers.createdAt)

    return NextResponse.json(answersList)
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 })
  }
}