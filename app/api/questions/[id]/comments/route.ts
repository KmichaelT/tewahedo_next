import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { comments, users, likes } from "@/lib/schema"
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

    // Get comments with author info and like counts
    const commentsWithDetails = await db
      .select({
        id: comments.id,
        content: comments.content,
        authorId: comments.authorId,
        questionId: comments.questionId,
        answerId: comments.answerId,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        // Author info
        authorName: users.name,
        authorDisplayName: users.displayName,
        authorImage: users.image,
        authorIsAdmin: users.isAdmin,
        // Like count
        likeCount: sql<number>`cast(count(${likes.id}) as int)`,
        // Whether current user liked this comment
        isLiked: session?.user?.id 
          ? sql<boolean>`count(case when ${likes.userId} = ${session.user.id} then 1 end) > 0`
          : sql<boolean>`false`,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .leftJoin(
        likes, 
        and(
          eq(likes.targetType, "comment"),
          eq(likes.targetId, comments.id)
        )
      )
      .where(eq(comments.questionId, questionId))
      .groupBy(
        comments.id,
        users.name,
        users.displayName,
        users.image,
        users.isAdmin
      )
      .orderBy(comments.createdAt)

    // Transform the data to match the expected Comment interface
    const transformedComments = commentsWithDetails.map(comment => ({
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      questionId: comment.questionId,
      answerId: comment.answerId,
      parentId: comment.parentId,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      author: {
        id: comment.authorId,
        name: comment.authorDisplayName || comment.authorName || "Anonymous",
        image: comment.authorImage,
        isAdmin: comment.authorIsAdmin || false,
      },
      likes: comment.likeCount,
      isLiked: comment.isLiked,
      level: 0, // Will be calculated in the frontend
    }))

    return NextResponse.json(transformedComments)
  } catch (error) {
    console.error("Error fetching question comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}