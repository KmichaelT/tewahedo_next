import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { comments, likes } from "@/lib/schema"
import { eq, and, sql } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const commentId = Number.parseInt(id)

    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
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
          eq(likes.targetType, "comment"),
          eq(likes.targetId, commentId)
        )
      )

    return NextResponse.json(result[0] || { likeCount: 0, isLiked: false })
  } catch (error) {
    console.error("Error getting comment likes:", error)
    return NextResponse.json(
      { error: "Failed to get comment likes" },
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

    // Check if comment exists
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

    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, session.user.id),
          eq(likes.targetType, "comment"),
          eq(likes.targetId, commentId)
        )
      )
      .limit(1)

    if (existingLike) {
      return NextResponse.json(
        { error: "Comment already liked" },
        { status: 400 }
      )
    }

    // Add like
    await db.insert(likes).values({
      userId: session.user.id,
      targetType: "comment",
      targetId: commentId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error liking comment:", error)
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 }
    )
  }
}

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

    // Remove like
    const deletedLikes = await db
      .delete(likes)
      .where(
        and(
          eq(likes.userId, session.user.id),
          eq(likes.targetType, "comment"),
          eq(likes.targetId, commentId)
        )
      )
      .returning()

    if (deletedLikes.length === 0) {
      return NextResponse.json(
        { error: "Like not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unliking comment:", error)
    return NextResponse.json(
      { error: "Failed to unlike comment" },
      { status: 500 }
    )
  }
}