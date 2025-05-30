import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { comments, likes } from "@/lib/schema"
import { eq, and } from "drizzle-orm"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const commentId = Number.parseInt(id)

    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
        { status: 400 }
      )
    }

    const db = requireDatabase()

    // Get the comment to check permissions
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    // Check if user can delete (admin or author within 1 hour)
    const canDelete = session.user.isAdmin || 
      (comment.authorId === session.user.id && 
       new Date(comment.createdAt).getTime() > Date.now() - 60 * 60 * 1000)

    if (!canDelete) {
      return NextResponse.json(
        { error: "You can only delete your own comments within 1 hour, or be an admin" },
        { status: 403 }
      )
    }

    // Delete the comment (this will cascade to delete replies due to FK constraints)
    await db
      .delete(comments)
      .where(eq(comments.id, commentId))

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    )
  }
}