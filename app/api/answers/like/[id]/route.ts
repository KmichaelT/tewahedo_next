// app/api/answers/like/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireDatabase } from "@/lib/db"
import { answers, likes, users } from "@/lib/schema"
import { eq, and, sql } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const answerId = Number.parseInt(id)
    
    console.log("GET answer like status - Answer ID:", answerId)

    if (isNaN(answerId)) {
      return NextResponse.json(
        { error: "Invalid answer ID" },
        { status: 400 }
      )
    }

    const db = requireDatabase()
    const session = await getServerSession(authOptions)
    
    console.log("Session user:", session?.user?.id)

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
          eq(likes.targetType, "answer"),
          eq(likes.targetId, answerId)
        )
      )

    console.log("Like status result:", result[0])
    return NextResponse.json(result[0] || { likeCount: 0, isLiked: false })
  } catch (error) {
    console.error("Error getting answer likes:", error)
    return NextResponse.json(
      { error: "Failed to get answer likes" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("=== ANSWER LIKE POST REQUEST ===")
    
    const session = await getServerSession(authOptions)
    console.log("Session:", {
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      isAdmin: session?.user?.isAdmin
    })
    
    if (!session?.user?.id) {
      console.log("No session - returning 401")
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const db = requireDatabase()
    
    // Ensure user exists in database
    if (session.user.email) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)

      if (existingUser.length === 0) {
        console.log("Creating missing user in database")
        await db.insert(users).values({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name || null,
          displayName: session.user.name || session.user.email.split('@')[0],
          image: session.user.image || null,
          photoURL: session.user.image || null,
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        console.log("✅ Created missing user")
      }
    }

    const { id } = await params
    const answerId = Number.parseInt(id)
    console.log("Answer ID:", answerId)

    if (isNaN(answerId)) {
      console.log("Invalid answer ID - returning 400")
      return NextResponse.json(
        { error: "Invalid answer ID" },
        { status: 400 }
      )
    }

    console.log("Database connection established")

    // Check if answer exists
    const [answer] = await db
      .select()
      .from(answers)
      .where(eq(answers.id, answerId))
      .limit(1)

    console.log("Answer found:", !!answer)

    if (!answer) {
      console.log("Answer not found - returning 404")
      return NextResponse.json(
        { error: "Answer not found" },
        { status: 404 }
      )
    }

    // Check if already liked
    const existingLikes = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, session.user.id),
          eq(likes.targetType, "answer"),
          eq(likes.targetId, answerId)
        )
      )

    console.log("Existing likes found:", existingLikes.length)

    if (existingLikes.length > 0) {
      console.log("Already liked - returning success")
      return NextResponse.json({
        success: true,
        message: "Already liked",
        alreadyLiked: true
      })
    }

    // Add like
    console.log("Adding new like...")
    const [newLike] = await db.insert(likes).values({
      userId: session.user.id,
      targetType: "answer",
      targetId: answerId,
    }).returning()

    console.log("New like created:", newLike)

    // Update answer votes count
    console.log("Updating answer vote count...")
    const [updatedAnswer] = await db
      .update(answers)
      .set({ votes: sql`${answers.votes} + 1` })
      .where(eq(answers.id, answerId))
      .returning()

    console.log("Updated answer votes:", updatedAnswer?.votes)

    return NextResponse.json({ 
      success: true, 
      alreadyLiked: false,
      newVotes: updatedAnswer?.votes 
    })
    
  } catch (error) {
    console.error("=== ERROR IN ANSWER LIKE POST ===")
    console.error("Error:", error)
    
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    return NextResponse.json(
      { 
        error: "Failed to like answer", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("=== ANSWER UNLIKE DELETE REQUEST ===")
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const answerId = Number.parseInt(id)
    console.log("Unliking answer ID:", answerId)

    if (isNaN(answerId)) {
      return NextResponse.json(
        { error: "Invalid answer ID" },
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
          eq(likes.targetType, "answer"),
          eq(likes.targetId, answerId)
        )
      )
      .returning()

    console.log("Deleted likes:", deletedLikes.length)

    if (deletedLikes.length === 0) {
      return NextResponse.json(
        { error: "Like not found" },
        { status: 404 }
      )
    }

    // Update answer votes count
    const [updatedAnswer] = await db
      .update(answers)
      .set({ votes: sql`${answers.votes} - 1` })
      .where(eq(answers.id, answerId))
      .returning()

    console.log("Updated answer votes after unlike:", updatedAnswer?.votes)

    return NextResponse.json({ 
      success: true,
      newVotes: updatedAnswer?.votes 
    })
    
  } catch (error) {
    console.error("Error unliking answer:", error)
    return NextResponse.json(
      { error: "Failed to unlike answer" },
      { status: 500 }
    )
  }
}