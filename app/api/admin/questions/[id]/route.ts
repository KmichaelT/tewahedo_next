import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { questions } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const questionId = Number.parseInt(params.id)
    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !["pending", "published", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const [updatedQuestion] = await db.update(questions).set({ status }).where(eq(questions.id, questionId)).returning()

    if (!updatedQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const questionId = Number.parseInt(params.id)
    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    await db.delete(questions).where(eq(questions.id, questionId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
