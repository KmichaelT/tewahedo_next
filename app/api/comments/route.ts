import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { comments, users, likes } from "@/lib/schema"
import { eq, and, sql } from "drizzle-orm"
import { z } from "zod"

// Input validation schema
const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  questionId: z.number().optional(),
  answerId: z.number().optional(),
  parentId: z.number().optional(),
}).refine(
  (data) => data.questionId || data.answerId,
  {
    message: "Either questionId or answerId must be provided",
  }
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = createCommentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid input", 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      )
    }

    const { content, questionId, answerId, parentId } = validationResult.data
    const db = requireDatabase()

    // Validate parent comment exists and check nesting level
    if (parentId) {
      const [parentComment] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, parentId))
        .limit(1)

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        )
      }

      // Check nesting level (max 3 levels: 0, 1, 2)
      let currentLevel = 0
      let currentParent = parentComment.parentId
      
      while (currentParent && currentLevel < 3) {
        const [grandParent] = await db
          .select()
          .from(comments)
          .where(eq(comments.id, currentParent))
          .limit(1)
        
        if (!grandParent) break
        currentLevel++
        currentParent = grandParent.parentId
      }

      if (currentLevel >= 2) {
        return NextResponse.json(
          { error: "Maximum nesting level reached (3 levels)" },
          { status: 400 }
        )
      }
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        content,
        authorId: session.user.id,
        questionId: questionId || null,
        answerId: answerId || null,
        parentId: parentId || null,
      })
      .returning()

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get("questionId")
    const answerId = searchParams.get("answerId")

    if (!questionId && !answerId) {
      return NextResponse.json(
        { error: "Either questionId or answerId must be provided" },
        { status: 400 }
      )
    }

    const db = requireDatabase()
    const session = await getServerSession(authOptions)

    // Build the where condition
    let whereCondition
    if (questionId) {
      whereCondition = eq(comments.questionId, parseInt(questionId))
    } else if (answerId) {
      whereCondition = eq(comments.answerId, parseInt(answerId))
    }

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
      .where(whereCondition!)
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
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}